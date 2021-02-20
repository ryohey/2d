import { DragBeginEvent, DragMoveEvent, DragEndEvent } from "../components/Drag"
import { GraphStore } from "../stores/GraphStore"
import { Code } from "../stores/CodeStore"

export const createMouseHandler = (graphStore: GraphStore) => ({
  onMouseDown(e: DragBeginEvent) {
    if (e.start === null) {
      return
    }
  },

  onMouseDragMove(e: DragMoveEvent) {
    if (e.start === null) {
      return
    }
    if (e.start.type === "FuncNodeHeader") {
      graphStore.updateNode(e.start.node.id, (b) => ({
        ...b,
        x: e.movement.x + e.start.node.x,
        y: e.movement.y + e.start.node.y,
      }))
    }

    if (e.start.type === "ToolBoxItem") {
      const code: Code = e.start.code
      graphStore.previewNode = {
        ...code,
        id: 0,
        type: "FuncNode",
        linked: false,
        x: e.startPosition.x + e.movement.x,
        y: e.startPosition.y + e.movement.y,
      }
    }
  },

  onMouseUp(e: DragEndEvent) {
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
  },
})
