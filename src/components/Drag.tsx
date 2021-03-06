import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { IPoint } from "../types"

export interface DragEvent {
  originEvent: React.MouseEvent<HTMLDivElement, MouseEvent>
}

export interface DragBeginEvent extends DragEvent {
  start: any | null
}

export interface DragMoveEvent extends DragEvent {
  startPosition: IPoint
  movement: IPoint
  start: any | null
}

export interface DragEndEvent extends DragEvent {
  startPosition: IPoint
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
  container: HTMLDivElement | null
}

type DragContextData = DragState & { handler: MouseHandler | null }

export const DragContext = createContext<
  [DragContextData, (state: DragContextData) => void]
>([
  {
    startData: null,
    startPosition: null,
    container: null,
    handler: null,
  },
  () => {},
])

type DivPropsWithoutMouse = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onMouseDown" | "onMouseUp"
>

export type DragContainerProps = DivPropsWithoutMouse &
  MouseHandler & {
    onMount?: (instance: HTMLDivElement | null) => void
  }

export const DragContainer: FC<DragContainerProps> = (props) => {
  const {
    onMouseDown,
    onMouseDragMove,
    onMouseUp,
    children,
    ...restProps
  } = props
  const [state, setState] = useState<DragState>({
    startData: null,
    startPosition: null,
    container: null,
  })
  const divRef = useRef(null)
  useEffect(() => {
    setState((state) => ({
      ...state,
      container: divRef.current,
    }))
  }, [])
  return (
    <DragContext.Provider
      value={[
        { ...state, handler: { onMouseDown, onMouseDragMove, onMouseUp } },
        setState,
      ]}
    >
      <DragTrigger data={null} onMount={divRef} {...restProps}>
        {children}
      </DragTrigger>
    </DragContext.Provider>
  )
}

export type DragTriggerProps = DivPropsWithoutMouse & {
  data: any
  onMount?: React.ClassAttributes<HTMLDivElement>["ref"]
}

export const DragTrigger: FC<DragTriggerProps> = (props) => {
  const { data, onMount, ...restProps } = props
  const [state, setState] = useContext(DragContext)

  const getRelativePosition = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const offset =
      state.container !== null
        ? {
            x: state.container.offsetLeft,
            y: state.container.offsetTop,
          }
        : { x: 0, y: 0 }
    return {
      x: e.pageX - offset.x,
      y: e.pageY - offset.y,
    }
  }

  return (
    <div
      {...restProps}
      ref={onMount}
      onMouseDown={(e) => {
        e.stopPropagation()
        if (state.handler !== null) {
          setState({
            ...state,
            startData: data,
            startPosition: getRelativePosition(e),
          })
          state.handler.onMouseDown({
            originEvent: e,
            start: data,
          })
        }
      }}
      onMouseMove={(e) => {
        e.stopPropagation()
        if (state.handler !== null && state.startPosition !== null) {
          const pos = getRelativePosition(e)
          state.handler.onMouseDragMove({
            originEvent: e,
            startPosition: state.startPosition,
            movement: {
              x: pos.x - state.startPosition.x,
              y: pos.y - state.startPosition.y,
            },
            start: state.startData,
          })
        }
      }}
      onMouseUp={(e) => {
        e.stopPropagation()
        if (
          state.handler !== null &&
          state.startPosition !== null &&
          state.container !== null
        ) {
          setState({
            ...state,
            startData: null,
            startPosition: null,
          })
          const pos = getRelativePosition(e)
          state.handler.onMouseUp({
            originEvent: e,
            startPosition: state.startPosition,
            movement: {
              x: pos.x - state.startPosition.x,
              y: pos.y - state.startPosition.y,
            },
            start: state.startData,
            end: data,
          })
        }
      }}
    />
  )
}
