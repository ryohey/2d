import React, { MouseEvent, useState, SFC } from "react"
import { Block } from "./Block"
import { IPoint, ICodeBlock, isReferenceBlock, isCodeBlock } from "../types"
import { EditBlockModal } from "./EditBlockModal"
import { BlockStore } from "../stores/BlockStore"
import { DrawCanvas } from "../components/DrawCanvas"
import { NodeId } from "../topology/Graph"

interface ClickData {
  type: string
  id: NodeId
  start?: IPoint
  startOffset?: IPoint
}

export interface StageProps {
  blockStore: BlockStore
}

export interface StageState {
  modalIsOpen: boolean
  editingBlock: ICodeBlock | null
}

export const Stage: SFC<StageProps> = ({ blockStore }) => {
  const { previewBlock } = blockStore
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [click, setClick] = useState<ClickData | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState<Boolean>(false)
  const [editingBlock, setEditingBlock] = useState<ICodeBlock | null>(null)
  const [blockElements, setBlockElements] = useState<{
    [id: number]: HTMLElement | undefined
  }>({})

  const positionOfInput = (id: NodeId, index: number) => {
    const block = blockElements[id]
    if (block === undefined) {
      return {
        x: 0,
        y: 0
      }
    }
    return {
      x: block.offsetLeft,
      y: block.offsetTop + 54 + 20 * index
    }
  }

  const positionOfOutput = (id: NodeId) => {
    const block = blockElements[id]
    if (block === undefined) {
      return {
        x: 0,
        y: 0
      }
    }
    return {
      x: block.offsetLeft + block.clientWidth,
      y: block.offsetTop + 54
    }
  }

  const renderEdges = (ctx: CanvasRenderingContext2D) => {
    const { edges, previewEdge } = blockStore
    const { canvas } = ctx

    const renderCurve = (from: IPoint, to: IPoint) => {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      const curveLength = Math.abs(to.x - from.x) * 0.3
      ctx.bezierCurveTo(
        from.x + curveLength,
        from.y,
        to.x - curveLength,
        to.y,
        to.x,
        to.y
      )
      ctx.stroke()
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = "white"
    for (let edge of edges) {
      const from = positionOfOutput(edge.fromId)
      const to = positionOfInput(edge.toId, edge.toIndex)
      renderCurve(from, to)
    }

    if (previewEdge) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      const from = positionOfOutput(previewEdge.fromId)
      renderCurve(from, previewEdge.toPosition)
    }
  }

  const onMouseUpStage = () => {
    setClick(null)
    blockStore.previewEdge = null

    const { previewBlock } = blockStore
    if (previewBlock) {
      blockStore.previewBlock = null
      blockStore.addNode(previewBlock)
    }
  }

  const onDoubleClickStage = (e: MouseEvent<any>) => {
    setClick(null)
    const bounds = e.currentTarget.getBoundingClientRect()
    blockStore.addNode({
      type: "CodeBlock",
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
      name: "func",
      code: `x => x`,
      isAsync: false,
      id: -1
    })
  }

  const onMouseMoveStage = (e: MouseEvent<any>) => {
    if (blockStore.previewBlock) {
      const bounds = e.currentTarget.getBoundingClientRect()
      blockStore.previewBlock = {
        ...blockStore.previewBlock,
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top
      }
      return
    }

    if (!click) {
      return
    }

    switch (click.type) {
      case "block": {
        if (click === null) {
          break
        }
        const { startOffset, start } = click
        if (startOffset === undefined || start === undefined) {
          break
        }
        const delta = {
          x: e.clientX - startOffset.x,
          y: e.clientY - startOffset.y
        }

        blockStore.updateNode(click.id, b => ({
          ...b,
          x: start.x + delta.x,
          y: start.y + delta.y
        }))
        break
      }
      case "edge": {
        const bounds = e.currentTarget.getBoundingClientRect()
        blockStore.previewEdge = {
          fromId: click.id,
          toPosition: {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top
          }
        }
      }
    }
  }

  const onMouseDownBlockHeader = (e: MouseEvent<any>, id: NodeId) => {
    const block = blockStore.getBlock(id)
    setClick({
      type: "block",
      id,
      start: {
        x: block.x,
        y: block.y
      },
      startOffset: {
        x: e.clientX,
        y: e.clientY
      }
    })
  }

  const openModalWithBlock = (id: NodeId) => {
    let block = blockStore.getBlock(id)
    block = isReferenceBlock(block)
      ? blockStore.getBlock(block.reference)
      : block
    if (isCodeBlock(block)) {
      setModalIsOpen(true)
      setEditingBlock(block)
    }
  }

  const onDoubleClickBlockHeader = (e: MouseEvent<any>, id: NodeId) => {
    setClick(null)
    openModalWithBlock(id)
  }

  const onMouseDownBlockInput = (
    e: MouseEvent<any>,
    id: NodeId,
    index: number
  ) => {}

  const onMouseUpBlockInput = (e: MouseEvent<any>, id: NodeId, i: number) => {
    setClick(null)
    if (!click) {
      return
    }

    if (click.type === "edge") {
      blockStore.addEdge(click.id, id, i)
    }
  }

  const onDoubleClickBlockBody = (e: MouseEvent<any>, id: NodeId) => {
    setClick(null)
    openModalWithBlock(id)
  }

  const onMouseDownBlockOutput = (e: MouseEvent<any>, id: NodeId) => {
    setClick({
      type: "edge",
      id
    })
  }

  const onMouseUpBlockOutput = (e: MouseEvent<any>, id: NodeId) => {
    setClick(null)
    if (!click) {
      return
    }
    if (click.type === "edge") {
      blockStore.removeEdge(id)
    }
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const onClickBlockRemove = (e: MouseEvent<any>, id: NodeId) => {
    blockStore.removeBlock(id)
  }

  const onClickBlockDupulicate = (e: MouseEvent<any>, id: NodeId) => {
    const block = blockStore.getBlock(id)
    blockStore.addNode({
      ...block,
      y: block.y + 180
    })
  }

  const onClickBlockMakeReference = (e: MouseEvent<any>, id: NodeId) => {
    const block = blockStore.getBlock(id)
    const reference = isReferenceBlock(block) ? block.reference : id
    blockStore.addNode({
      type: "ReferenceBlock",
      reference,
      x: block.x,
      y: block.y + 180,
      id: -1
    })
  }

  return (
    <div
      onDoubleClick={onDoubleClickStage}
      onMouseUp={onMouseUpStage}
      onMouseMove={onMouseMoveStage}
      className="Stage"
      ref={setContainer}
    >
      {container !== null && (
        <DrawCanvas
          draw={renderEdges}
          width={container.clientWidth}
          height={container.clientHeight}
        />
      )}
      {blockStore.allDisplayBlocks().map(b => {
        return (
          <Block
            onMouseDownHeader={onMouseDownBlockHeader}
            onDoubleClickHeader={onDoubleClickBlockHeader}
            onMouseDownInput={onMouseDownBlockInput}
            onMouseUpInput={onMouseUpBlockInput}
            onMouseDownOutput={onMouseDownBlockOutput}
            onMouseUpOutput={onMouseUpBlockOutput}
            onDoubleClickBody={onDoubleClickBlockBody}
            onClickDupulicate={onClickBlockDupulicate}
            onClickRemove={onClickBlockRemove}
            onClickMakeReference={onClickBlockMakeReference}
            {...b}
            inputNames={b.inputNames}
            name={b.name}
            code={b.code}
            linked={b.linked}
            isAsync={b.isAsync}
            key={b.id}
            containerRef={c => {
              if (c != null) {
                blockElements[b.id] = c
                setBlockElements(blockElements)
              }
            }}
          />
        )
      })}
      {previewBlock && (
        <Block
          linked={false}
          key="preview"
          isPreview={true}
          {...previewBlock}
        />
      )}
      {modalIsOpen && editingBlock !== null && (
        <EditBlockModal
          closeModal={closeModal}
          blockStore={blockStore}
          block={editingBlock}
        />
      )}
    </div>
  )
}
