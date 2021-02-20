import React, { FC } from "react"
import { useRecoilState } from "recoil"
import Icon from "../components/Icon"
import buildCode from "../helpers/buildCode"
import { edgesState, nodesState } from "../stores/GraphStore"

export const Toolbar: FC<{
  onClickHelp: () => void
}> = ({ onClickHelp }) => {
  const [edges, setEdges] = useRecoilState(edgesState)
  const [nodes, setNodes] = useRecoilState(nodesState)

  const onClickPlay = () => {
    const code = buildCode({ edges, nodes })
    eval(code)
  }

  const onClickClear = () => {
    setEdges([])
    setNodes([])
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
