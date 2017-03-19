import React, { Component } from "react"
import "./App.css"

function Block({ onMouseOver, onMouseDown, code, x, y }) {
  // TODO: Components.utils.Sandbox を使う
  const func = eval(`() => { return ${code} }`)()

  return <div
    className="Block"
    onMouseOver={onMouseOver}
    onMouseDown={onMouseDown}
    style={{ left: x, top: y }}>
    <div className="header">
      <div className="name">{func.name}</div>
    </div>
    <div className="ports">
      <div className="inputs">
        {[...Array(func.length).keys()].map(i =>
          <div className="input">in</div>
        )}
      </div>
      <div className="outputs">
        <div className="output">out</div>
      </div>
    </div>
    <textarea className="code" value={code} />
  </div>
}

function Stage(props) {
  const exampleCode = `function test(a, b) {
    return a + b
  }`
  return <div>
    <Block code={exampleCode} x={40} y={40} />
    <Block code={`function(str) { console.log(str) }`} x={40} y={200} />
  </div>
}

class App extends Component {
  render() {
    return <div className="App">
      <Stage />
    </div>
  }
}

export default App
