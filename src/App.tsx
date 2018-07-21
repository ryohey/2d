import React, { Component } from "react"
import { observer } from "mobx-react"
import Icon from "./Icon"
import _Stage from "./Stage"
import BlockStore from "./BlockStore"
import CodeStore from "./CodeStore"
import buildCode from "./helpers/buildCode"
import exampleBlocks from "./helpers/exampleBlocks"
import exampleCodes from "./helpers/exampleCodes"

import "./App.css"

const blockStore = new BlockStore()
const codeStore = new CodeStore()

exampleBlocks.blocks.forEach(b => blockStore.addBlock(b))
blockStore.edges = exampleBlocks.edges
codeStore.codes = exampleCodes()

function _CodeOutput({ blockStore }: { blockStore: BlockStore }) {
  const code = buildCode(blockStore.blocks, blockStore.edges)
  return (
    <div className="CodeOutput">
      <pre>{code}</pre>
    </div>
  )
}

const Stage = observer(_Stage)
const CodeOutput = observer(_CodeOutput)

class App extends Component {
  render() {
    const onClickPlay = () => {
      const code = buildCode(blockStore.blocks, blockStore.edges)
      eval(code)
    }

    const onClickClear = () => {
      blockStore.edges = []
      blockStore.blocks = []
    }

    return (
      <div className="App">
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
        </div>
        <div className="main">
          <div className="ToolBox">
            <div className="header">toolbox</div>
            {codeStore.codes.map((c, i) => (
              <div
                key={i}
                className="item"
                onMouseDown={e => {
                  e.stopPropagation()
                  const parent = e.currentTarget.parentElement
                  if (parent == null) {
                    return
                  }
                  const bounds = parent.getBoundingClientRect()
                  blockStore.previewBlock = {
                    ...c,
                    x: e.clientX - bounds.width,
                    y: e.clientY - bounds.top,
                    inputLength: c.inputLength
                  }
                }}
              >
                <div className="name">{c.name}</div>
                <Icon name="arrow-top-right" />
              </div>
            ))}
          </div>
          <div className="content">
            <Stage blockStore={blockStore} />
            <CodeOutput blockStore={blockStore} />
          </div>
        </div>
      </div>
    )
  }
}

export default App
