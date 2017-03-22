import _ from "lodash"

function wrapPromiseAll(values) {
  if (values.length === 1) {
    return `${values[0]}`
  }
  return `Promise.all([${values.join(", ")}])`
}

export default function buildCode(blocks, edges) {
  function getFuncVarName(block) {
    const f = block.name ? `${block.name}` : `func${block.id}`
    if (window[f] !== undefined) {
      // グローバルな関数と名前が被らないようにする
      return `__${f}`
    }
    return f
  }

  const func = blocks
    .filter(b => b.code)
    .map(b => `const ${getFuncVarName(b)} = ${b.code}`)
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

    /**
    const out6_p = Promise.all([
      out4_p,
      out5_p
    ]).then(([out4, out5]) =>
      add(out4, out5)
    )
    */
    terminals.forEach(t => {
      const { id, inputs } = t
      let block = _.find(blocks, { id })
      if (block.link !== undefined) {
        block = _.find(blocks, { id: block.link })
      }
      const promiseInputs = inputs.filter(i => i.endsWith("_p"))
      const isAsync = block.isAsync || promiseInputs.length > 0
      const varName = isAsync ? `out${outputIndex}_p` : `out${outputIndex}`
      outputIndex++
      outputVarNames[id] = varName
      const funcName = getFuncVarName(block)
      if (promiseInputs.length > 0) {
        const resultNames = promiseInputs.map(i => i.split("_p")[0])
        const promise = wrapPromiseAll(promiseInputs)
        const params = inputs.map(i => i.split("_p")[0]).join(", ") // _p を除去する
        const result = resultNames.length === 1 ? `${resultNames}` : `([${resultNames.join(", ")}])`
        procs.push(`const ${varName} = ${promise}.then(${result} =>
  ${funcName}(${params})
)`)
      } else {
        procs.push(`const ${varName} = ${funcName}(${inputs.join(", ")})`)
      }
    })
  }

  return `${func}\n\n${procs.join("\n")}`
}
