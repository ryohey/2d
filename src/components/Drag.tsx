import React, { SFC, createContext, useState, useContext } from "react"
import { IPoint } from "../types"

export interface DragEvent {
  originEvent: React.MouseEvent<HTMLDivElement, MouseEvent>
}

export interface DragBeginEvent extends DragEvent {
  start: any | null
}

export interface DragMoveEvent extends DragEvent {
  movement: IPoint
  start: any | null
}

export interface DragEndEvent extends DragEvent {
  movement: IPoint | null
  start: any | null
  end: any | null
}

export interface MouseHandler {
  onMouseDown: (e: DragBeginEvent) => void
  onMouseDragMove: (e: DragMoveEvent) => void
  onMouseUp: (e: DragEndEvent) => void
}

interface DragState {
  startData: any | null
  startPosition: IPoint | null
  handler: MouseHandler | null
}

export const DragContext = createContext<
  [DragState, (state: DragState) => void]
>([
  {
    startData: null,
    startPosition: null,
    handler: null
  },
  () => {}
])

type DivPropsWithoutMouse = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onMouseDown" | "onMouseUp"
>

export type DragContainerProps = DivPropsWithoutMouse &
  MouseHandler & {
    onMount: (instance: HTMLDivElement | null) => void
  }

export const DragContainer: SFC<DragContainerProps> = props => {
  const { onMouseDown, onMouseDragMove, onMouseUp } = props
  const [state, setState] = useState<DragState>({
    startData: null,
    startPosition: null,
    handler: { onMouseDown, onMouseDragMove, onMouseUp }
  })
  return (
    <DragContext.Provider value={[state, setState]}>
      <DragTrigger {...props} data={null} />
    </DragContext.Provider>
  )
}

export type DragTriggerProps = DivPropsWithoutMouse & {
  data: any
  onMount?: (instance: HTMLDivElement | null) => void
}

export const DragTrigger: SFC<DragTriggerProps> = props => {
  const { data, onMount } = props
  const [state, setState] = useContext(DragContext)

  return (
    <div
      {...props}
      ref={onMount}
      onMouseDown={e => {
        e.stopPropagation()
        if (state.handler !== null) {
          setState({
            ...state,
            startData: data,
            startPosition: { x: e.clientX, y: e.clientY }
          })
          state.handler.onMouseDown({
            originEvent: e,
            start: data
          })
        }
      }}
      onMouseMove={e => {
        e.stopPropagation()
        if (state.handler !== null && state.startPosition !== null) {
          state.handler.onMouseDragMove({
            originEvent: e,
            movement: {
              x: e.clientX - state.startPosition.x,
              y: e.clientY - state.startPosition.y
            },
            start: state.startData
          })
        }
      }}
      onMouseUp={e => {
        e.stopPropagation()
        if (state.handler !== null && state.startPosition !== null) {
          setState({
            ...state,
            startData: null,
            startPosition: null
          })
          state.handler.onMouseUp({
            originEvent: e,
            movement: {
              x: e.clientX - state.startPosition.x,
              y: e.clientY - state.startPosition.y
            },
            start: state.startData,
            end: data
          })
        }
      }}
    />
  )
}
