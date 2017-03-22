import { extendObservable, action, } from "mobx"
import _ from "lodash"

export default class BlockStore { constructor() { extendObservable(this, {
  blocks: [],
  edges: [],

  /**
    {
      x: Number,
      y: Number,
      inputLength: Number,
      name: String,
      code: String
    }
   */
  previewBlock: null,

  /**
    {
      fromId: Number,
      toPosition: {
        x: Number,
        y: Number
      }
    }
  */
  previewEdge: null,

  getBlock(id) {
    return this.blocks.filter(b => b.id === id)[0]
  },

  /**
   表示用の block オブジェクトを取得する
   inputLength など表示に必要なプロパティが追加されている
   link 先を取得しなくても表示できるように name プロパティなども追加する
   */
  getDisplayBlock(id) {
    const block = this.getBlock(id)
    const linked = this.getBlock(block.link)
    return {
      ...block,
      linked: block.link !== undefined,
      name: (linked || block).name,
      isAsync: (linked || block).isAsync,
      code: linked ? "" : block.code,
      inputLength: this.getBlockInputLength(id)
    }
  },

  allDisplayBlocks() {
    return this.blocks.map(b => this.getDisplayBlock(b.id))
  },

  addBlock: action(block => {
    this.blocks = [...this.blocks, {
      ...block,
      id: this.lastBlockId() + 1,
      name: this.getPreferredBlockName(block.name)
    }]
  }),

  getBlockInputLength: (id) => {
    let block = this.getBlock(id)
    if (block.link) {
      block = this.getBlock(block.link)
    }
    // TODO: Components.utils.Sandbox を使う
    const func = eval(`() => { return ${block.code} }`)()
    return func.length
  },

  getPreferredBlockName: requiredName => {
    let name = requiredName
    let count = 2
    while (_.find(this.blocks, { name })) {
      name = `${requiredName}${count}`
      count++
    }
    return name
  },

  removeBlock: action(id => {
    this.blocks = _.reject(this.blocks, { id })
    this.edges = _.reject(this.edges, e => e.toId === id || e.fromId === id)
    this.blocks.filter(b => b.link === id).forEach(b => this.removeBlock(b.id))
  }),

  lastBlockId() {
    return _.max([...this.blocks.map(b => b.id), -1])
  },

  updateBlock: action((id, updater) => {
    this.blocks = this.blocks.map(b => {
      if (b.id !== id) {
        return b
      }
      return updater(b)
    })
  }),

  addEdge: action((fromId, toId, toIndex) => {
    const edge = { fromId, toId, toIndex }
    if (!_.find(this.edges, edge)) {
      this.edges = [...this.edges, edge]
    }
  }),

  removeEdge: action((fromId) => {
    this.edges = _.reject(this.edges, { fromId })
  })
})}}
