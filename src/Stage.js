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
        code: "",
        isAsync: false
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
    const { edges, previewEdge } = this.props.blockStore
    const { canvas } = this
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")

    function renderCurve(from, to) {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      const curveLength = Math.abs(to.x - from.x) * 0.3
      ctx.bezierCurveTo(from.x + curveLength, from.y, to.x - curveLength, to.y, to.x, to.y)
      ctx.stroke()
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = "white"
    for (let edge of edges) {
      const from = this.positionOfOutput(edge.fromId)
      const to = this.positionOfInput(edge.toId, edge.toIndex)
      renderCurve(from, to)
    }

    if (previewEdge) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      const from = this.positionOfOutput(previewEdge.fromId)
      renderCurve(from, previewEdge.toPosition)
    }
  }

  render() {
    const { blockStore } = this.props
    const { previewBlock } = blockStore

    const onMouseUpStage = (e, id) => {
      this.click = null
      blockStore.previewEdge = null

      const { previewBlock } = blockStore
      if (previewBlock) {
        blockStore.previewBlock = null
        blockStore.addBlock(previewBlock)
      }
    }

    const onDoubleClickStage = e => {
      this.click = null
      const bounds = e.currentTarget.getBoundingClientRect()
      blockStore.addBlock({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
        name: "func",
        code: `x => x`
      })
    }

    const onMouseMoveStage = (e, id) => {
      if (blockStore.previewBlock) {
        const bounds = e.currentTarget.getBoundingClientRect()
        blockStore.previewBlock = {
          ...blockStore.previewBlock,
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.top,
        }
        return
      }

      const { click } = this
      if (!click) {
        return
      }

      switch (click.type) {
        case "block": {
          const delta = {
            x: e.clientX - click.startOffset.x,
            y: e.clientY - click.startOffset.y,
          }

          blockStore.updateBlock(click.id, b => ({
            ...b,
            x: click.start.x + delta.x,
            y: click.start.y + delta.y
          }))
          break
        }
        case "edge": {
          const bounds = e.currentTarget.getBoundingClientRect()
          blockStore.previewEdge = {
            fromId: click.id,
            toPosition: {
              x: e.clientX - bounds.left,
              y: e.clientY - bounds.top,
            }
          }
        }
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

    const openModalWithBlock = (id) => {
      let block = blockStore.getBlock(id)
      block = block.link ? blockStore.getBlock(block.link) : block
      this.setState({
        modalIsOpen: true,
        modalInput: {
          id: block.id,
          name: block.name,
          code: block.code,
          isAsync: block.isAsync
        }
      })
    }

    const onDoubleClickBlockHeader = (e, id) => {
      this.click = null
      e.stopPropagation()
      openModalWithBlock(id)
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
      this.click = null
      e.stopPropagation()
      openModalWithBlock(id)
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
        code: modalInput.code,
        isAsync: modalInput.isAsync
      }))
    }

    const onClickBlockRemove = (e, id) => {
      blockStore.removeBlock(id)
    }

    const onClickBlockDupulicate = (e, id) => {
      const block = blockStore.getBlock(id)
      blockStore.addBlock({
        ...block,
        y: block.y + 180
      })
    }

    const onClickBlockMakeReference = (e, id) => {
      const block = blockStore.getBlock(id)
      const link = block.link || id
      blockStore.addBlock({
        link,
        x: block.x,
        y: block.y + 180
      })
    }

    this.renderEdges()

    return <div
      onDoubleClick={onDoubleClickStage}
      onMouseUp={onMouseUpStage}
      onMouseMove={onMouseMoveStage}
      className="Stage"
      ref={c => this.container = c}>
      <canvas ref={c => this.canvas = c} />
      {blockStore.allDisplayBlocks().map(b => {
        return <Block
          onMouseDownHeader={onMouseDownBlockHeader}
          onDoubleClickHeader={onDoubleClickBlockHeader}
          onMouseDownInput={onMouseDownBlockInput}
          onMouseUpInput={onMouseUpBlockInput}
          onMouseDownOutput={onMouseDownBlockOutput}
          onMouseUpOutput={onMouseUpBlockOutput}
          onDoubleClickBody={onDoubleClickBlockBody}
          onClickDupulicate={onClickBlockDupulicate}
          onClickRemove={onClickBlockRemove}
          onClickMakeReference={onClickBlockMakeReference}
          {...b}
          inputLength={b.inputLength}
          name={b.name}
          code={b.code}
          linked={b.linked}
          isAsync={b.isAsync}
          key={b.id}
          containerRef={c => this.blockElements[b.id] = c} />
      })}
      {previewBlock && <Block key="preview" isPreview={true} {...previewBlock} />}
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
          <div className="section">
            <label>async</label>
            <div><input type="checkbox"
              checked={this.state.modalInput.isAsync}
              onChange={e => this.setState({ modalInput: {
                  ...this.state.modalInput,
                  isAsync: e.target.checked
              }})} /></div>
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
