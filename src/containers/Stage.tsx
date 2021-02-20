import React, { FC, MouseEvent, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { DrawCanvas } from "../components/DrawCanvas"
import { DropDownMenu } from "../components/DropDownMenu"
import {
  allDisplayNodes,
  createFuncNode,
  createVariableNode,
  edgesState,
  editingNodeState,
  nodesState,
  previewEdgeState,
  previewNodeState,
} from "../stores/GraphStore"
import { NodeId } from "../topology/Graph"
import { IPoint, isVariableNode } from "../types"
import { EditFuncModal } from "./EditFuncModal"
import { FuncNode } from "./FuncNode"
import { VariableNode } from "./VariableNode"

export interface StageState {
  modalIsOpen: boolean
}

export const Stage: FC = () => {
  const [edges, setEdges] = useRecoilState(edgesState)
  const [editingNode, setEditingNode] = useRecoilState(editingNodeState)
  const [nodes, setNodes] = useRecoilState(nodesState)
  const previewNode = useRecoilValue(previewNodeState)
  const previewEdge = useRecoilValue(previewEdgeState)
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
        y: 0,
      }
    }
    return {
      x: block.offsetLeft,
      y: block.offsetTop + 54 + 20 * index,
    }
  }

  const positionOfOutput = (id: NodeId) => {
    const block = blockElements[id]
    if (block === undefined) {
      return {
        x: 0,
        y: 0,
      }
    }
    return {
      x: block.offsetLeft + block.clientWidth,
      y: block.offsetTop + 54,
    }
  }

  const renderEdges = (ctx: CanvasRenderingContext2D) => {
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
    setNodes([...nodes, createVariableNode(x, y)])
  }

  const onDoubleClickStage = (e: MouseEvent<any>) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    })
  }

  const closeModal = () => {
    setEditingNode(null)
  }

  return (
    <div
      onDoubleClick={onDoubleClickStage}
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
      {allDisplayNodes(nodes).map((b) => {
        return (
          <FuncNode
            node={b}
            key={b.id}
            containerRef={(c) => {
              if (c != null) {
                blockElements[b.id] = c
                setBlockElements(blockElements)
              }
            }}
          />
        )
      })}
      {nodes.filter(isVariableNode).map((node) => (
        <VariableNode node={node} key={node.id} />
      ))}
      {previewNode && (
        <FuncNode key="preview" isPreview={true} node={previewNode} />
      )}
      {editingNode !== null && editingNode.type === "FuncNode" && (
        <EditFuncModal closeModal={closeModal} node={editingNode} />
      )}
      {menuPosition && (
        <DropDownMenu
          position={menuPosition}
          items={[
            {
              name: "new function node",
              onClick: (e) => {
                const bounds = e.currentTarget.getBoundingClientRect()
                setNodes([
                  ...nodes,
                  createFuncNode(
                    e.clientX - bounds.left,
                    e.clientY - bounds.top
                  ),
                ])
              },
            },
            {
              name: "new variable node",
              onClick: (e) => {
                const bounds = e.currentTarget.getBoundingClientRect()
                addNewVariableNode(
                  e.clientX - bounds.left,
                  e.clientY - bounds.top
                )
              },
            },
          ]}
          onRequestClose={() => setMenuPosition(null)}
        />
      )}
    </div>
  )
}
