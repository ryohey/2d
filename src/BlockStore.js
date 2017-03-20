import { extendObservable, action, } from "mobx"
import _ from "lodash"

export default class BlockStore { constructor() { extendObservable(this, {
  blocks: [],
  edges: [],
  previewBlock: null,

  getBlock(id) {
    return this.blocks.filter(b => b.id === id)[0]
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
