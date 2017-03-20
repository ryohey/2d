import React, { Component } from "react"
import _ from "lodash"
import Modal from "react-modal"
import Block from "./Block"

export default class Stage extends Component {
  constructor(props) {
    super(props)

    this.blockElements = []

    this.state = {
      modalInput: {
        id: 0,
        name: "",
        code: ""
      }
    }
  }

  positionOfInput(id, index) {
    const block = this.blockElements[id]
    return {
      x: block.offsetLeft,
      y: block.offsetTop + 54 + 20 * index
    }
  }

  positionOfOutput(id) {
    const block = this.blockElements[id]
    return {
      x: block.offsetLeft + block.clientWidth,
      y: block.offsetTop + 54
    }
  }

  componentDidMount() {
    this.canvas.width = this.container.clientWidth
    this.canvas.height = this.container.clientHeight
    this.renderEdges()
  }

  renderEdges() {
    const { canvas } = this
    if (!canvas) {
      return
    }

    const { edges } = this.props.blockStore
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = "white"
    for (let edge of edges) {
      const from = this.positionOfOutput(edge.fromId)
      const to = this.positionOfInput(edge.toId, edge.toIndex)
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      const curveLength = Math.abs(to.x - from.x) * 0.3
      ctx.bezierCurveTo(from.x + curveLength, from.y, to.x - curveLength, to.y, to.x, to.y)
      ctx.stroke()
    }
  }

  render() {
    const { blockStore } = this.props

    const onMouseUpStage = (e, id) => {
      this.click = null
    }

    const onDoubleClickStage = e => {
      this.click = null
      const bounds = e.currentTarget.getBoundingClientRect()
      blockStore.addBlock({
        id: blockStore.lastBlockId() + 1,
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
        name: "func",
        code: `x => x`
      })
    }

    const onMouseMoveStage = (e, id) => {
      const { click } = this
      if (!click) {
        return
      }

      if (click.type === "block") {
        const delta = {
          x: e.clientX - click.startOffset.x,
          y: e.clientY - click.startOffset.y,
        }

        blockStore.updateBlock(click.id, b => ({
          ...b,
          x: click.start.x + delta.x,
          y: click.start.y + delta.y
        }))
      }
    }

    const onMouseDownBlockHeader = (e, id) => {
      const block = blockStore.getBlock(id)
      this.click = {
        type: "block",
        id,
        start: {
          x: block.x,
          y: block.y
        },
        startOffset: {
          x: e.clientX,
          y: e.clientY
        }
      }
    }

    const onDoubleClickBlockHeader = (e, id) => {
      this.click = null
      e.stopPropagation()
      blockStore.removeBlock(id)
    }

    const onMouseDownBlockInput = (e, id, index) => {
    }

    const onMouseUpBlockInput = (e, id, i) => {
      const { click } = this
      this.click = null
      if (!click) {
        return
      }

      if (click.type === "edge") {
        blockStore.addEdge(click.id, id, i)
      }
    }

    const onDoubleClickBlockBody = (e, id) => {
      e.stopPropagation()
      const block = blockStore.getBlock(id)
      this.setState({
        modalIsOpen: true,
        modalInput: {
          id,
          name: block.name,
          code: block.code
        }
      })
    }

    const onMouseDownBlockOutput = (e, id) => {
      this.click = {
        type: "edge",
        id
      }
    }

    const onMouseUpBlockOutput = (e, id) => {
      const { click } = this
      this.click = null
      if (!click) {
        return
      }
      if (click.type === "edge") {
        blockStore.removeEdge(id)
      }
    }

    const closeModal = () => {
      this.setState({ modalIsOpen: false })
    }

    const onClickModalOK = e => {
      e.preventDefault()
      e.stopPropagation()
      closeModal()
      const { modalInput } = this.state
      blockStore.updateBlock(modalInput.id, b => ({
        ...b,
        name: modalInput.name,
        code: modalInput.code
      }))
    }

    this.renderEdges()

    return <div
      onDoubleClick={onDoubleClickStage}
      onMouseUp={onMouseUpStage}
      onMouseMove={onMouseMoveStage}
      className="Stage"
      ref={c => this.container = c}>
      <canvas ref={c => this.canvas = c} />
      {blockStore.blocks.map(b =>
        <Block
          onMouseDownHeader={onMouseDownBlockHeader}
          onDoubleClickHeader={onDoubleClickBlockHeader}
          onMouseDownInput={onMouseDownBlockInput}
          onMouseUpInput={onMouseUpBlockInput}
          onMouseDownOutput={onMouseDownBlockOutput}
          onMouseUpOutput={onMouseUpBlockOutput}
          onDoubleClickBody={onDoubleClickBlockBody}
          {...b}
          key={b.id}
          containerRef={c => this.blockElements[b.id] = c} />
      )}
      <Modal
        contentLabel="edit block"
        isOpen={this.state.modalIsOpen}
        onRequestClose={closeModal}
        overlayClassName="BlockModalOverlay"
        className="BlockModal">
        <form onSubmit={onClickModalOK}>
          <div className="section">
            <label>name</label>
            <input type="text"
              value={this.state.modalInput.name}
              onChange={e => this.setState({ modalInput: {
                ...this.state.modalInput,
                name: e.target.value
              }})} />
          </div>
          <div className="section">
            <label>code</label>
            <textarea
              value={this.state.modalInput.code}
              onChange={e => this.setState({ modalInput: {
                ...this.state.modalInput,
                code: e.target.value
              }})} />
          </div>
          <div className="section footer">
            <button type="button" className="button" onClick={closeModal}>Cancel</button>
            <button type="submit" className="button primary">OK</button>
          </div>
        </form>
      </Modal>
    </div>
  }
}
