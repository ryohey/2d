import _ from "lodash"
import { IBlock, IEdge, BlockId, ICodeBlock } from "../types"
import { notEmpty } from "./typeHelper"
import { createFunction } from "./functionHelper"

function wrapPromiseAll(values: string[]) {
  if (values.length === 1) {
    return `${values[0]}`
  }
  return `Promise.all([${values.join(", ")}])`
}

// 出力が未計算で入力が揃っている（もしくは無い）もの
interface Calculatable {
  id: BlockId
  inputs: string[]
}

export default function buildCode(blocks: ICodeBlock[], edges: IEdge[]) {
  function getFuncVarName(block: ICodeBlock) {
    const f = block.name ? `${block.name}` : `func${block.id}`
    if ((window as any)[f] !== undefined) {
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
  let procs: string[] = []

  // { block id : 出力変数名 }
  const outputVarNames: { [index: number]: string | null } = _.fromPairs(
    blocks.map(b => [b.id, null])
  )
  /**
    末端からグラフを走査してソースコードを生成する
    入力が揃っているノードの出力変数の名前を作っていく
  */
  while (true) {
    // 出力が未計算で入力が揃っている（もしくは無い）ものを探す
    const terminals: Calculatable[] = _.entries(outputVarNames)
      .map(e => {
        const id = parseInt(e[0])
        const computed = e[1] !== null
        if (computed) {
          // 出力が計算済み
          return null
        }

        let block: ICodeBlock | undefined = _.find(blocks, b => b.id === id)
        if (block && block.reference !== undefined) {
          block = _.find(blocks, { id: block.reference })
        }

        if (block === undefined) {
          return null
        }

        const code = block.code

        if (code === undefined) {
          return null
        }

        const func = createFunction(code)
        const noInput = func.length === 0
        if (noInput) {
          // 入力が無い
          return {
            id,
            inputs: []
          }
        }

        const inputs = _.range(func.length).map(i => {
          const edge = _.find(edges, e => e.toId === id && e.toIndex === i)
          if (edge) {
            return edge.fromId
          }
          return null
        })
        const inputVarNames = inputs.map(i =>
          i !== null ? outputVarNames[i] : "undefined"
        )
        const allInputComputed = _.every(inputVarNames, n => n !== null)

        if (!allInputComputed) {
          // 入力が揃っていない
          return null
        }

        return {
          id,
          inputs: inputVarNames.filter(notEmpty)
        }
      })
      .filter(notEmpty)

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
      let block: ICodeBlock | undefined = _.find(blocks, b => b.id === id)
      if (block && block.reference !== undefined) {
        block = _.find(blocks, { id: block.reference })
      }
      if (block === undefined) {
        return
      }
      const promiseInputs = inputs.filter(i => i.endsWith("_p"))
      const isAsync = block.isAsync || promiseInputs.length > 0
      const varName =
        `${block.name ? block.name : "block"}_out${outputIndex}` +
        (isAsync ? "_p" : "")
      outputIndex++
      outputVarNames[id] = varName
      const funcName = getFuncVarName(block)
      if (promiseInputs.length > 0) {
        const resultNames = promiseInputs.map(i => i.split("_p")[0])
        const promise = wrapPromiseAll(promiseInputs)
        const params = inputs.map(i => i.split("_p")[0]).join(", ") // _p を除去する
        const result =
          resultNames.length === 1
            ? `${resultNames}`
            : `([${resultNames.join(", ")}])`
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
