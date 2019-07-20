import React, { SFC } from "react"
import Icon from "../components/Icon"
import { BlockStore } from "../stores/BlockStore"
import buildCode from "../helpers/buildCode"

export const Toolbar: SFC<{
  blockStore: BlockStore
  onClickHelp: () => void
}> = ({ blockStore, onClickHelp }) => {
  const onClickPlay = () => {
    const code = buildCode(blockStore.nodes, blockStore.edges)
    eval(code)
  }

  const onClickClear = () => {
    blockStore.edges = []
    blockStore.nodes = []
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
