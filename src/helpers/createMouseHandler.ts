import { useCallback } from "react"
import { DragBeginEvent, DragEndEvent, DragMoveEvent } from "../components/Drag"
import { useAppDispatch, useAppSelector } from "../hooks"
import { Code } from "../stores/CodeStore"
import {
  addEdge,
  addNode,
  removeEdge,
  setPreviewEdge,
  setPreviewNode,
  updateNode,
} from "../stores/GraphStore"

export const useMouseHandler = () => {
  const {
    current: { nodes, edges },
    previewNode,
  } = useAppSelector((state) => state.graph)
  const dispatch = useAppDispatch()

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
          dispatch(
            updateNode({
              id: e.start.node.id,
              updater: (b) => ({
                ...b,
                x: e.movement.x + e.start.node.x,
                y: e.movement.y + e.start.node.y,
              }),
            })
          )
          break
        case "ToolBoxItem":
          const code: Code = e.start.code
          dispatch(
            setPreviewNode({
              ...code,
              id: 0,
              type: "FuncNode",
              linked: false,
              x: e.startPosition.x + e.movement.x,
              y: e.startPosition.y + e.movement.y,
            })
          )
          break
        case "FuncNodeOutput":
          dispatch(
            setPreviewEdge({
              fromId: e.start.node.id,
              toPosition: {
                x: e.startPosition.x + e.movement.x,
                y: e.startPosition.y + e.movement.y,
              },
            })
          )
          break
      }
    },
    [dispatch]
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
            dispatch(
              addEdge({
                fromId: e.start.node.id,
                toId: e.end.node.id,
                toIndex: e.end.index,
              })
            )
          }
          // 同じポートでドラッグした場合はエッジを削除
          if (
            e.start.type === "FuncNodeOutput" &&
            e.end.type === "FuncNodeOutput" &&
            e.start.node.id === e.end.node.id
          ) {
            dispatch(removeEdge(e.start.node.id))
          }
        }
        if (
          e.start.type === "ToolBoxItem" &&
          (e.end === null || e.end.node.id === 0)
        ) {
          if (previewNode) {
            dispatch(addNode(previewNode))
          }
        }
      }

      dispatch(setPreviewNode(null))
      dispatch(setPreviewEdge(null))
    },
    [previewNode, dispatch]
  )

  return {
    onMouseDown,
    onMouseDragMove,
    onMouseUp,
  }
}
