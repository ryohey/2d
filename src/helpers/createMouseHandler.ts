import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import { DragBeginEvent, DragEndEvent, DragMoveEvent } from "../components/Drag"
import { Code } from "../stores/CodeStore"
import { GraphStore, previewEdgeState } from "../stores/GraphStore"

export const useMouseHandler = (graphStore: GraphStore) => {
  const setPreviewEdge = useSetRecoilState(previewEdgeState)

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
          graphStore.updateNode(e.start.node.id, (b) => ({
            ...b,
            x: e.movement.x + e.start.node.x,
            y: e.movement.y + e.start.node.y,
          }))
          break
        case "ToolBoxItem":
          const code: Code = e.start.code
          graphStore.previewNode = {
            ...code,
            id: 0,
            type: "FuncNode",
            linked: false,
            x: e.startPosition.x + e.movement.x,
            y: e.startPosition.y + e.movement.y,
          }
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
    [graphStore, setPreviewEdge]
  )

  const onMouseUp = useCallback((e: DragEndEvent) => {
    console.log(e)
    if (e.start !== null) {
      if (e.end !== null) {
        if (
          e.start.type === "FuncNodeOutput" &&
          e.end.type === "FuncNodeInput"
        ) {
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
      } else {
        if (e.start.type === "ToolBoxItem") {
          const { previewNode } = graphStore
          if (previewNode) {
            graphStore.previewNode = null
            graphStore.addNode(previewNode)
          }
        }
      }
    }
  }, [])

  return {
    onMouseDown,
    onMouseDragMove,
    onMouseUp,
  }
}
