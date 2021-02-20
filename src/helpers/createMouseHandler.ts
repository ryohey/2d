import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { DragBeginEvent, DragEndEvent, DragMoveEvent } from "../components/Drag"
import { Code } from "../stores/CodeStore"
import {
  addEdge,
  addNode,
  edgesState,
  nodesState,
  previewEdgeState,
  previewNodeState,
  removeEdge,
  updateNode,
} from "../stores/GraphStore"

export const useMouseHandler = () => {
  const [nodes, setNodes] = useRecoilState(nodesState)
  const [edges, setEdges] = useRecoilState(edgesState)
  const [previewEdge, setPreviewEdge] = useRecoilState(previewEdgeState)
  const [previewNode, setPreviewNode] = useRecoilState(previewNodeState)

  const onMouseDown = useCallback((e: DragBeginEvent) => {
    if (e.start === null) {
      return
    }
  }, [])

  const onMouseDragMove = useCallback(
    (e: DragMoveEvent) => {
      if (e.start === null) {
        return
      }
      switch (e.start.type) {
        case "FuncNodeHeader":
          setNodes(
            updateNode(nodes)(e.start.node.id, (b) => ({
              ...b,
              x: e.movement.x + e.start.node.x,
              y: e.movement.y + e.start.node.y,
            }))
          )
          break
        case "ToolBoxItem":
          const code: Code = e.start.code
          setPreviewNode({
            ...code,
            id: 0,
            type: "FuncNode",
            linked: false,
            x: e.startPosition.x + e.movement.x,
            y: e.startPosition.y + e.movement.y,
          })
          break
        case "FuncNodeOutput":
          setPreviewEdge({
            fromId: e.start.node.id,
            toPosition: {
              x: e.startPosition.x + e.movement.x,
              y: e.startPosition.y + e.movement.y,
            },
          })
          break
      }
    },
    [setNodes, nodes, setPreviewNode, setPreviewEdge]
  )

  const onMouseUp = useCallback(
    (e: DragEndEvent) => {
      console.log(e)
      if (e.start !== null) {
        if (e.end !== null) {
          if (
            e.start.type === "FuncNodeOutput" &&
            e.end.type === "FuncNodeInput"
          ) {
            setEdges(
              addEdge(edges)(e.start.node.id, e.end.node.id, e.end.index)
            )
          }
          // 同じポートでドラッグした場合はエッジを削除
          if (
            e.start.type === "FuncNodeOutput" &&
            e.end.type === "FuncNodeOutput" &&
            e.start.node.id === e.end.node.id
          ) {
            setEdges(removeEdge(edges)(e.start.node.id))
          }
        }
        if (
          e.start.type === "ToolBoxItem" &&
          (e.end === null || e.end.node.id === 0)
        ) {
          if (previewNode) {
            setNodes(addNode(nodes)(previewNode))
          }
        }
      }

      setPreviewNode(null)
      setPreviewEdge(null)
    },
    [
      nodes,
      setNodes,
      edges,
      setEdges,
      previewNode,
      setPreviewNode,
      setPreviewEdge,
    ]
  )

  return {
    onMouseDown,
    onMouseDragMove,
    onMouseUp,
  }
}
