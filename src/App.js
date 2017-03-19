import React, { Component } from "react"
import _ from "lodash"
import Modal from "react-modal"
import Icon from "./Icon"

import "./App.css"

function Port({ type, onMouseDown, onMouseUp }) {
  return <div className="Port" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
    <Icon name={`arrow-${type}-drop-circle-outline`} />
  </div>
}

function Block({
  code,
  name,
  x,
  y,
  id,
  containerRef,
  onMouseDownHeader,
  onMouseDownInput,
  onMouseUpInput,
  onMouseDownOutput,
  onMouseUpOutput
}) {
  // TODO: Components.utils.Sandbox を使う
  const func = eval(`() => { return ${code} }`)()

  return <div
    className="Block"
    style={{ left: x, top: y }}
    ref={containerRef}>
    <div
      className="header"
      onMouseDown={e => onMouseDownHeader(e, id)}>
      <div className="name">{name}</div>
    </div>
    <div className="ports">
      <div className="inputs">
        {[...Array(func.length).keys()].map(i =>
          <Port type="right" className="input" key={i}
            onMouseDown={e => onMouseDownInput(e, id, i)}
            onMouseUp={e => onMouseUpInput(e, id, i)} />
        )}
      </div>
      <div className="outputs">
        <Port type="right" className="output"
          onMouseDown={e => onMouseDownOutput(e, id)}
          onMouseUp={e => onMouseUpOutput(e, id)} />
      </div>
    </div>
    <pre className="code">{code}</pre>
  </div>
}

class Stage extends Component {
  constructor(props) {
    super(props)

    this.blockElements = []

    this.state = {
      blocks: [
        {
          id: 0,
          name: "add",
          code: "(a, b) => a + b",
          x: 40,
          y: 40
        },
        {
          id: 1,
          name: "log",
          code: `str => console.log(str)`,
          x: 280,
          y: 150
        }
      ],
      edges: [
        {
          fromId: 0,
          toId: 1,
          toIndex: 0
        }
      ]
    }
  }

  getBlock(id) {
    return this.state.blocks.filter(b => b.id === id)[0]
  }

  addEdge(fromId, toId, toIndex) {
    const edge = { fromId, toId, toIndex }
    if (!_.find(this.state.edges, edge)) {
      this.setState({
        edges: [...this.state.edges, edge]
      })
    }
  }

  removeEdge(fromId) {
    this.setState({
      edges: this.state.edges.filter(e => e.fromId !== fromId)
    })
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

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = "white"
    for (let edge of this.state.edges) {
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
    const onMouseUpStage = (e, id) => {
      this.click = null
    }

    const onMouseDownStage = e => {

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

        this.setState({
          blocks: this.state.blocks.map(b => {
            if (b.id !== click.id) {
              return b
            }
            return {
              ...b,
              x: click.start.x + delta.x,
              y: click.start.y + delta.y
            }
          })
        })
      }
    }

    const onMouseDownBlockHeader = (e, id) => {
      const block = this.getBlock(id)
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

    const onMouseDownBlockInput = (e, id, index) => {
    }

    const onMouseUpBlockInput = (e, id, i) => {
      const { click } = this
      this.click = null
      if (!click) {
        return
      }

      if (click.type === "edge") {
        this.addEdge(click.id, id, i)
      }
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
        this.removeEdge(id)
      }
    }

    this.renderEdges()

    return <div
      onMouseDown={onMouseDownStage}
      onMouseUp={onMouseUpStage}
      onMouseMove={onMouseMoveStage}
      className="Stage"
      ref={c => this.container = c}>
      <canvas ref={c => this.canvas = c} />
      {this.state.blocks.map(b =>
        <Block
          onMouseDownHeader={onMouseDownBlockHeader}
          onMouseDownInput={onMouseDownBlockInput}
          onMouseUpInput={onMouseUpBlockInput}
          onMouseDownOutput={onMouseDownBlockOutput}
          onMouseUpOutput={onMouseUpBlockOutput}
          {...b}
          key={b.id}
          containerRef={c => this.blockElements[b.id] = c} />
      )}
    </div>
  }
}

class App extends Component {
  render() {
    return <div className="App">
      <div className="Toolbar">
        <a className="ToolbarButton">
          <Icon name="play" />
        </a>
      </div>
      <Stage />
    </div>
  }
}

export default App
