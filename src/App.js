import React, { Component } from "react"
import { observer } from "mobx-react"
import _ from "lodash"
import Icon from "./Icon"
import _Stage from "./Stage"
import BlockStore from "./BlockStore"

import "./App.css"

const blockStore = new BlockStore()

const blocks = [
  {
    name: "constant",
    code: "() => 1",
    x: 20,
    y: 20
  },
  {
    name: "constant2",
    code: "() => 2",
    x: 20,
    y: 180
  },
  {
    name: "add",
    code: "(a, b) => a + b",
    x: 180 * 2,
    y: 20
  },
  {
    name: "popup",
    code: `str => alert(str)`,
    x: 180 * 3,
    y: 20
  },
  {
    name: "double",
    code: `x => x * 2`,
    x: 180 * 3,
    y: 180
  },
  {
    link: 4,
    x: 180,
    y: 180
  },
  {
    link: 4,
    x: 180,
    y: 20
  }
]

blocks.forEach(b => blockStore.addBlock(b))

blockStore.edges = [
  {
    fromId: 0,
    toId: 6,
    toIndex: 0
  },
  {
    fromId: 1,
    toId: 5,
    toIndex: 0
  },
  {
    fromId: 6,
    toId: 2,
    toIndex: 0
  },
  {
    fromId: 5,
    toId: 2,
    toIndex: 1
  },
  {
    fromId: 2,
    toId: 3,
    toIndex: 0
  },
]

function buildCode(blocks, edges) {
  const func = blocks
    .filter(b => b.code)
    .map(b => `const ${b.name} = ${b.code}`)
    .join("\n")

  let outputIndex = 0
  let procs = []

  // { block id : 出力変数名 }
  const outputVarNames = _.fromPairs(blocks.map(b => [b.id, null]))
  /**
    末端からグラフを走査してソースコードを生成する
    入力が揃っているノードの出力変数の名前を作っていく
  */
  while (true) {
    // 出力が未計算で入力が揃っている（もしくは無い）ものを探す
    const terminals = _.entries(outputVarNames).map(e => {
      const id = parseInt(e[0])
      const computed = e[1] !== null
      if (computed) {
        // 出力が計算済み
        return null
      }

      let block = _.find(blocks, { id })
      if (block.link !== undefined) {
        block = _.find(blocks, { id: block.link })
      }

      // TODO: Components.utils.Sandbox を使う
      const func = eval(`() => { return ${block.code} }`)()
      const noInput = func.length === 0
      if (noInput) {
        // 入力が無い
        return {
          id, inputs: []
        }
      }

      const inputs = _.range(func.length).map(i => {
        const edge = _.find(edges, { toId: id, toIndex: i })
        if (edge) {
          return edge.fromId
        }
        return null
      })
      const inputVarNames = inputs.map(i => i !== null ? outputVarNames[i] : "undefined")
      const allInputComputed = _.every(inputVarNames, n => n !== null)

      if (!allInputComputed) {
        // 入力が揃っていない
        return null
      }

      return {
        id, inputs: inputVarNames
      }
    }).filter(t => t)

    if (terminals.length === 0) {
      break
    }

    terminals.forEach(t => {
      const { id, inputs } = t
      let block = _.find(blocks, { id })
      if (block.link !== undefined) {
        block = _.find(blocks, { id: block.link })
      }
      const varName = `out${outputIndex++}`
      outputVarNames[id] = varName
      procs.push(`const ${varName} = ${block.name || `__func${id}`}(${inputs.join(", ")})`)
    })
  }

  return `${func}\n\n${procs.join("\n")}`
}

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
        </div>
        <div className="content">
          <Stage blockStore={blockStore} />
          <CodeOutput blockStore={blockStore} />
        </div>
      </div>
    </div>
  }
}

export default App
