import React, { Component } from "react"
import { observer } from "mobx-react"
import Icon from "./Icon"
import _Stage from "./Stage"
import BlockStore from "./BlockStore"
import CodeStore from "./CodeStore"
import buildCode from "./helpers/buildCode"
import exampleBlocks from "./helpers/exampleBlocks"

import "./App.css"

const blockStore = new BlockStore()
const codeStore = new CodeStore()

exampleBlocks.blocks.forEach(b => blockStore.addBlock(b))
blockStore.edges = exampleBlocks.edges

function _CodeOutput({ blockStore }) {
  const code = buildCode(blockStore.blocks, blockStore.edges)
  return <div className="CodeOutput">
    <pre>{code}</pre>
  </div>
}

const Stage = observer(_Stage)
const CodeOutput = observer(_CodeOutput)

class App extends Component {
  render() {
    const onClickPlay = () => {
      const code = buildCode(blockStore.blocks, blockStore.edges)
      eval(code)
    }

    return <div className="App">
      <div className="Toolbar">
        <a className="ToolbarButton" onClick={onClickPlay}>
          <Icon name="play" />
        </a>
      </div>
      <div className="main">
        <div className="ToolBox">
          <div className="item" onMouseDown={e => {
            e.stopPropagation()
            const bounds = e.target.getBoundingClientRect()
            blockStore.previewBlock = {
              x: e.clientX - bounds.width,
              y: e.clientY - bounds.top,
              inputLength: 1,
              name: "func",
              code: ""
            }
          }}>
            <div className="name">Script</div>
          </div>
        </div>
        <div className="content">
          <Stage blockStore={blockStore} codeStore={codeStore} />
          <CodeOutput blockStore={blockStore} />
        </div>
      </div>
    </div>
  }
}

export default App
