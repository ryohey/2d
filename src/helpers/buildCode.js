import _ from "lodash"

export default function buildCode(blocks, edges) {
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
      const varName = block.isAsync ?
        `out${outputIndex}_p` : `out${outputIndex}`
      outputIndex++
      outputVarNames[id] = varName
      const funcName = block.name || `__func${id}`
      const promiseInput = _.find(inputs, i => i.endsWith("_p"))
      if (promiseInput) {
        const resultName = promiseInput.split("_p")[0]
        procs.push(`const ${varName} = ${promiseInput}.then(${resultName} =>
  ${funcName}(${inputs.map(i => i === promiseInput ? resultName : i).join(", ")})
)`)
      } else {
        procs.push(`const ${varName} = ${funcName}(${inputs.join(", ")})`)
      }
    })
  }

  return `${func}\n\n${procs.join("\n")}`
}
