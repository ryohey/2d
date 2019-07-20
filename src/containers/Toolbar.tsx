import React, { SFC } from "react"
import Icon from "../components/Icon"
import { GraphStore } from "../stores/GraphStore"
import buildCode from "../helpers/buildCode"

export const Toolbar: SFC<{
  graphStore: GraphStore
  onClickHelp: () => void
}> = ({ graphStore, onClickHelp }) => {
  const onClickPlay = () => {
    const code = buildCode(graphStore.nodes, graphStore.edges)
    eval(code)
  }

  const onClickClear = () => {
    graphStore.edges = []
    graphStore.nodes = []
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
