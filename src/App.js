import React, { Component } from "react"
import { observer } from "mobx-react"
import _ from "lodash"
import Icon from "./Icon"
import _Stage from "./Stage"
import BlockStore from "./BlockStore"

import "./App.css"

const blockStore = new BlockStore()

blockStore.blocks = [
  {
    id: 0,
    name: "constant",
    code: "() => 1",
    x: 20,
    y: 20
  },
  {
    id: 1,
    name: "constant2",
    code: "() => 2",
    x: 20,
    y: 180
  },
  {
    id: 2,
    name: "add",
    code: "(a, b) => a + b",
    x: 180,
    y: 20
  },
  {
    id: 3,
    name: "log",
    code: `str => console.log(str)`,
    x: 370,
    y: 20
  }
]

blockStore.edges = [
  {
    fromId: 0,
    toId: 2,
    toIndex: 0
  },
  {
    fromId: 1,
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
  const func = blocks.map(b => `const ${b.name} = ${b.code}`).join("\n")
  // const procs = edges.map(e => {
  //   const b = _.find(blocks, { id: e.fromId })
  //   return `const out1 = ${b.name}()`
  // }).join("\n")

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

      const block = _.find(blocks, { id })

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
        const edge = _.find(edges, { toId: block.id, toIndex: i })
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
      const block = _.find(blocks, { id })
      const varName = `out${outputIndex++}`
      outputVarNames[id] = varName
      procs.push(`const ${varName} = ${block.name}(${inputs.join(", ")})`)
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
      <Stage blockStore={blockStore} />
      <CodeOutput blockStore={blockStore} />
    </div>
  }
}

export default App
