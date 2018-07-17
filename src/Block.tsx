import React, { Component, SFC } from "react"
import Icon from "./Icon"
import "./Block.css"
import _ from "lodash"

function Port({ type, onMouseDown, onMouseUp }) {
  return (
    <div className="Port" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      <Icon name={`arrow-${type}-drop-circle-outline`} />
    </div>
  )
}

function DropDownMenu({ items, onRequestClose }) {
  function onClick(e, handler) {
    onRequestClose()
    handler(e)
  }
  return (
    <div className="drop-down">
      {items.map((item, i) => (
        <div onClick={e => onClick(e, item.onClick)} key={i}>
          {item.name}
        </div>
      ))}
    </div>
  )
}

const Block: SFC<any> = ({
  code,
  name,
  x,
  y,
  id,
  linked,
  isAsync,
  isPreview,
  inputLength,
  containerRef,
  onMouseDownHeader,
  onDoubleClickHeader,
  onMouseDownInput,
  onMouseUpInput,
  onMouseDownOutput,
  onMouseUpOutput,
  onDoubleClickBody,
  onClickMakeReference,
  onClickDupulicate,
  onClickRemove,
  isMenuOpened,
  openMenu,
  closeMenu
}) => {
  const classes = [
    "Block",
    linked && "linked",
    isAsync && "async",
    isPreview && "preview"
  ]

  return (
    <div
      className={classes.filter(c => c).join(" ")}
      style={{ left: x, top: y }}
      ref={containerRef}
    >
      <div
        className="header"
        onMouseDown={e => onMouseDownHeader(e, id)}
        onDoubleClick={e => onDoubleClickHeader(e, id)}
      >
        <div className="name">
          {linked && <Icon name="link" className="link-icon" />}
          {name}
        </div>
        <div
          className="menu-button"
          onDoubleClick={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            isMenuOpened ? closeMenu() : openMenu()
          }}
        >
          <Icon name="menu-down" />
        </div>
      </div>
      {isMenuOpened && (
        <DropDownMenu
          items={[
            {
              name: "make reference",
              onClick: e => onClickMakeReference(e, id)
            },
            { name: "duplicate", onClick: e => onClickDupulicate(e, id) },
            { name: "remove", onClick: e => onClickRemove(e, id) }
          ]}
          onRequestClose={closeMenu}
        />
      )}
      <div className="ports">
        <div className="inputs">
          {_.range(inputLength).map(i => (
            <Port
              type="right"
              key={i}
              onMouseDown={e => onMouseDownInput(e, id, i)}
              onMouseUp={e => onMouseUpInput(e, id, i)}
            />
          ))}
        </div>
        <div className="outputs">
          <Port
            type="right"
            onMouseDown={e => onMouseDownOutput(e, id)}
            onMouseUp={e => onMouseUpOutput(e, id)}
          />
        </div>
      </div>
      {!linked && (
        <pre className="code" onDoubleClick={e => onDoubleClickBody(e, id)}>
          {code}
        </pre>
      )}
    </div>
  )
}

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isMenuOpened: false
    }
  }

  render() {
    return (
      <Block
        {...this.props}
        {...this.state}
        openMenu={() => {
          this.setState({ isMenuOpened: true })
        }}
        closeMenu={() => {
          this.setState({ isMenuOpened: false })
        }}
      />
    )
  }
}