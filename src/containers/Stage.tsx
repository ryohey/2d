import React, { MouseEvent, useState, SFC } from "react"
import { FuncNode } from "./FuncNode"
import {
  IPoint,
  IFuncNode,
  isReferenceFuncNode,
  isFuncNode,
  isVariableNode
} from "../types"
import { EditFuncModal } from "./EditFuncModal"
import { GraphStore } from "../stores/GraphStore"
import { DrawCanvas } from "../components/DrawCanvas"
import { NodeId } from "../topology/Graph"
import { VariableNode } from "./VariableNode"
import { DropDownMenu } from "../components/DropDownMenu"

interface ClickData {
  type: string
  id: NodeId
  start?: IPoint
  startOffset?: IPoint
}

export interface StageProps {
  graphStore: GraphStore
}

export interface StageState {
  modalIsOpen: boolean
  editingBlock: IFuncNode | null
}

export const Stage: SFC<StageProps> = ({ graphStore }) => {
  const { previewNode } = graphStore
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [click, setClick] = useState<ClickData | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState<Boolean>(false)
  const [editingBlock, setEditingBlock] = useState<IFuncNode | null>(null)
  const [blockElements, setBlockElements] = useState<{
    [id: number]: HTMLElement | undefined
  }>({})
  const [menuPosition, setMenuPosition] = useState<IPoint | null>(null)

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
    const { edges, previewEdge } = graphStore
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
    graphStore.previewEdge = null

    const { previewNode } = graphStore
    if (previewNode) {
      graphStore.previewNode = null
      graphStore.addNode(previewNode)
    }
  }

  const addNewFuncNode = (x: number, y: number) => {
    graphStore.addNode({
      type: "FuncNode",
      x,
      y,
      name: "func",
      code: `x => x`,
      isAsync: false,
      id: -1
    })
  }

  const addNewVariableNode = (x: number, y: number) => {
    graphStore.addNode({
      type: "VariableNode",
      x,
      y,
      name: "variable",
      id: -1,
      value: ""
    })
  }

  const onDoubleClickStage = (e: MouseEvent<any>) => {
    setClick(null)

    const bounds = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    })
  }

  const onMouseMoveStage = (e: MouseEvent<any>) => {
    if (graphStore.previewNode) {
      const bounds = e.currentTarget.getBoundingClientRect()
      graphStore.previewNode = {
        ...graphStore.previewNode,
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

        graphStore.updateNode(click.id, b => ({
          ...b,
          x: start.x + delta.x,
          y: start.y + delta.y
        }))
        break
      }
      case "edge": {
        const bounds = e.currentTarget.getBoundingClientRect()
        graphStore.previewEdge = {
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
    const block = graphStore.getFuncNode(id)
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
    let block = graphStore.getFuncNode(id)
    block = isReferenceFuncNode(block)
      ? graphStore.getFuncNode(block.reference)
      : block
    if (isFuncNode(block)) {
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
      graphStore.addEdge(click.id, id, i)
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
      graphStore.removeEdge(id)
    }
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const onClickBlockRemove = (e: MouseEvent<any>, id: NodeId) => {
    graphStore.removeNode(id)
  }

  const onClickBlockDupulicate = (e: MouseEvent<any>, id: NodeId) => {
    const block = graphStore.getFuncNode(id)
    graphStore.addNode({
      ...block,
      y: block.y + 180
    })
  }

  const onClickBlockMakeReference = (e: MouseEvent<any>, id: NodeId) => {
    const block = graphStore.getFuncNode(id)
    const reference = isReferenceFuncNode(block) ? block.reference : id
    graphStore.addNode({
      type: "ReferenceFuncNode",
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
      {graphStore.allDisplayNodes().map(b => {
        return (
          <FuncNode
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
            node={b}
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
      {graphStore.nodes.filter(isVariableNode).map(node => (
        <VariableNode node={node} key={node.id} />
      ))}
      {previewNode && (
        <FuncNode key="preview" isPreview={true} node={previewNode} />
      )}
      {modalIsOpen && editingBlock !== null && (
        <EditFuncModal
          closeModal={closeModal}
          graphStore={graphStore}
          node={editingBlock}
        />
      )}
      {menuPosition && (
        <DropDownMenu
          position={menuPosition}
          items={[
            {
              name: "new function node",
              onClick: e => {
                const bounds = e.currentTarget.getBoundingClientRect()
                addNewFuncNode(e.clientX - bounds.left, e.clientY - bounds.top)
              }
            },
            {
              name: "new variable node",
              onClick: e => {
                const bounds = e.currentTarget.getBoundingClientRect()
                addNewVariableNode(
                  e.clientX - bounds.left,
                  e.clientY - bounds.top
                )
              }
            }
          ]}
          onRequestClose={() => setMenuPosition(null)}
        />
      )}
    </div>
  )
}
