import React, { Component, SFC, MouseEvent } from "react"
import Icon from "./Icon"
import "./Block.css"
import _, { Omit } from "lodash"
import { DisplayBlock, BlockId } from "./types"

export interface PortProps {
  type: string
  onMouseDown: (e: MouseEvent<any>) => void
  onMouseUp: (e: MouseEvent<any>) => void
}

const Port: SFC<PortProps> = ({ type, onMouseDown, onMouseUp }) => {
  return (
    <div className="Port" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      <Icon name={`arrow-${type}-drop-circle-outline`} />
    </div>
  )
}

export interface DropDownItem {
  name: string
  onClick: (e: MouseEvent<any>) => void
}

export interface DropDownMenuProps {
  items: DropDownItem[]
  onRequestClose: () => void
}

const DropDownMenu: SFC<DropDownMenuProps> = ({ items, onRequestClose }) => {
  return (
    <div className="drop-down">
      {items.map((item, i) => (
        <div
          onClick={e => {
            onRequestClose()
            item.onClick(e)
          }}
          key={i}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

export type BlockProps = DisplayBlock & {
  isPreview?: boolean
  containerRef?: (c: HTMLElement | null) => void
  onMouseDownHeader?: (e: MouseEvent<any>, id: BlockId) => void
  onDoubleClickHeader?: (e: MouseEvent<any>, id: BlockId) => void
  onMouseDownInput?: (e: MouseEvent<any>, id: BlockId, index: number) => void
  onMouseUpInput?: (e: MouseEvent<any>, id: BlockId, index: number) => void
  onMouseDownOutput?: (e: MouseEvent<any>, id: BlockId) => void
  onMouseUpOutput?: (e: MouseEvent<any>, id: BlockId) => void
  onDoubleClickBody?: (e: MouseEvent<any>, id: BlockId) => void
  onClickMakeReference?: (e: MouseEvent<any>, id: BlockId) => void
  onClickDupulicate?: (e: MouseEvent<any>, id: BlockId) => void
  onClickRemove?: (e: MouseEvent<any>, id: BlockId) => void
  isMenuOpened: boolean
  openMenu: () => void
  closeMenu: () => void
}

const NOP = () => {}

const Block: SFC<BlockProps> = ({
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
  onMouseDownHeader = NOP,
  onDoubleClickHeader = NOP,
  onMouseDownInput = NOP,
  onMouseUpInput = NOP,
  onMouseDownOutput = NOP,
  onMouseUpOutput = NOP,
  onDoubleClickBody = NOP,
  onClickMakeReference = NOP,
  onClickDupulicate = NOP,
  onClickRemove = NOP,
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
      ref={c => {
        if (containerRef !== undefined) {
          containerRef(c)
        }
      }}
    >
      <div
        className="header"
        onMouseDown={e => onMouseDownHeader(e, id)}
        onDoubleClick={e => {
          e.stopPropagation()
          onDoubleClickHeader(e, id)
        }}
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

export default class extends Component<
  Omit<BlockProps, "isMenuOpened" | "openMenu" | "closeMenu">
> {
  state = {
    isMenuOpened: false
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
