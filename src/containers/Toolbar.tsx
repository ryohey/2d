import React, { FC } from "react"
import Icon from "../components/Icon"
import buildCode from "../helpers/buildCode"
import { useAppDispatch, useAppSelector } from "../hooks"
import { setEdges, setNodes } from "../stores/GraphStore"

export const Toolbar: FC<{
  onClickHelp: () => void
}> = ({ onClickHelp }) => {
  const graph = useAppSelector((state) => state.graph.current)
  const dispatch = useAppDispatch()

  const onClickPlay = () => {
    const code = buildCode(graph)
    eval(code)
  }

  const onClickClear = () => {
    dispatch(setEdges([]))
    dispatch(setNodes([]))
  }

  return (
    <div className="Toolbar">
      <a className="ToolbarButton" onClick={onClickPlay}>
        <Icon name="play" />
      </a>
      <a className="ToolbarButton" onClick={onClickClear}>
        <Icon name="delete" />
      </a>
      <a
        className="ToolbarButton"
        target="_blank"
        href="https://github.com/ryohey/2d"
      >
        <Icon name="github-circle" />
      </a>
      <a className="ToolbarButton" onClick={onClickHelp}>
        Help
      </a>
    </div>
  )
}
