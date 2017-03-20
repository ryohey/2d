import React from "react"
import Icon from "./Icon"
import "./Block.css"

function Port({ type, onMouseDown, onMouseUp }) {
  return <div className="Port" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
    <Icon name={`arrow-${type}-drop-circle-outline`} />
  </div>
}

export default function Block({
  code,
  name,
  x,
  y,
  id,
  containerRef,
  onMouseDownHeader,
  onDoubleClickHeader,
  onMouseDownInput,
  onMouseUpInput,
  onMouseDownOutput,
  onMouseUpOutput,
  onDoubleClickBody
}) {
  // TODO: Components.utils.Sandbox を使う
  const func = eval(`() => { return ${code} }`)()

  return <div
    className="Block"
    style={{ left: x, top: y }}
    ref={containerRef}>
    <div
      className="header"
      onMouseDown={e => onMouseDownHeader(e, id)}
      onDoubleClick={e => onDoubleClickHeader(e, id)}>
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
    <pre className="code" onDoubleClick={e => onDoubleClickBody(e, id)}>{code}</pre>
  </div>
}
