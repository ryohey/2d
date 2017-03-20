import React, { Component } from "react"
import { observer } from "mobx-react"
import Icon from "./Icon"
import _Stage from "./Stage"
import BlockStore from "./BlockStore"

import "./App.css"

const blockStore = new BlockStore()

blockStore.blocks = [
  {
    id: 0,
    name: "add",
    code: "(a, b) => a + b",
    x: 40,
    y: 40
  },
  {
    id: 1,
    name: "log",
    code: `str => console.log(str)`,
    x: 280,
    y: 150
  }
]

blockStore.edges = [
  {
    fromId: 0,
    toId: 1,
    toIndex: 0
  }
]

const Stage = observer(_Stage)

class App extends Component {
  render() {
    return <div className="App">
      <div className="Toolbar">
        <a className="ToolbarButton">
          <Icon name="play" />
        </a>
      </div>
      <Stage blockStore={blockStore} />
    </div>
  }
}

export default App
