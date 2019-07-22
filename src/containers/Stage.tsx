import React, { MouseEvent, useState, SFC } from "react"
import { FuncNode } from "./FuncNode"
import { IPoint, isVariableNode } from "../types"
import { EditFuncModal } from "./EditFuncModal"
import { GraphStore } from "../stores/GraphStore"
import { DrawCanvas } from "../components/DrawCanvas"
import { NodeId } from "../topology/Graph"
import { VariableNode } from "./VariableNode"
import { DropDownMenu } from "../components/DropDownMenu"
import {
  DragContainer,
  DragMoveEvent,
  DragBeginEvent,
  DragEndEvent
} from "../components/Drag"

export interface StageProps {
  graphStore: GraphStore
}

export interface StageState {
  modalIsOpen: boolean
}

export const Stage: SFC<StageProps> = ({ graphStore }) => {
  const { previewNode } = graphStore
  const [container, setContainer] = useState<HTMLElement | null>(null)
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
    const bounds = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    })
  }

  const onMouseDownStage = (e: DragBeginEvent) => {}

  const onMouseMoveStage = (e: DragMoveEvent) => {
    if (e.start === null) {
      return
    }
    if (e.start.type === "FuncNodeHeader") {
      graphStore.updateNode(e.start.node.id, b => ({
        ...b,
        x: e.movement.x + e.start.node.x,
        y: e.movement.y + e.start.node.y
      }))
    }
  }

  const onMouseUpStage = (e: DragEndEvent) => {
    if (e.start === null || e.end === null) {
      return
    }
    if (e.start.type === "FuncNodeOutput" && e.end.type === "FuncNodeInput") {
      graphStore.addEdge(e.start.node.id, e.end.node.id, e.end.index)
    }
    // 同じポートでドラッグした場合はエッジを削除
    if (
      e.start.type === "FuncNodeOutput" &&
      e.end.type === "FuncNodeOutput" &&
      e.start.node.id === e.end.node.id
    ) {
      graphStore.removeEdge(e.start.node.id)
    }
  }

  const closeModal = () => {
    graphStore.editingNode = null
  }

  return (
    <DragContainer
      onDoubleClick={onDoubleClickStage}
      onMouseDown={onMouseDownStage}
      onMouseUp={onMouseUpStage}
      onMouseDragMove={onMouseMoveStage}
      className="Stage"
      onMount={setContainer}
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
            graphStore={graphStore}
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
        <FuncNode
          graphStore={graphStore}
          key="preview"
          isPreview={true}
          node={previewNode}
        />
      )}
      {graphStore.editingNode !== null &&
        graphStore.editingNode.type === "FuncNode" && (
          <EditFuncModal
            closeModal={closeModal}
            graphStore={graphStore}
            node={graphStore.editingNode}
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
                graphStore.addNewFuncNode(
                  e.clientX - bounds.left,
                  e.clientY - bounds.top
                )
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
    </DragContainer>
  )
}
