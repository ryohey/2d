import { extendObservable, action, } from "mobx"
import _ from "lodash"

export default class BlockStore {
  constructor() {
    extendObservable(this, {
      blocks: [],
      edges: [],

      getBlock(id) {
        return this.blocks.filter(b => b.id === id)[0]
      },

      addBlock: action(block => {
        this.blocks = [...this.blocks, block]
      }),

      removeBlock: action(id => {
        this.setState({
          blocks: _.reject(this.blocks, { id }),
          edges: _.reject(this.edges, { toId: id })
        })
      }),

      lastBlockId() {
        return _.maxBy(this.blocks, "id").id
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
    })
  }
}
