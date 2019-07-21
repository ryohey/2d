import React, { SFC, MouseEvent, useState } from "react"
import Icon from "../components/Icon"
import "./FuncNode.css"
import { DisplayFuncNode } from "../types"
import { DropDownMenu } from "../components/DropDownMenu"
import { NodeId } from "../topology/Graph"

export interface PortProps {
  name: string
  onMouseDown: (e: MouseEvent<any>) => void
  onMouseUp: (e: MouseEvent<any>) => void
}

const LeftPort: SFC<PortProps> = ({ name, onMouseDown, onMouseUp }) => {
  return (
    <div
      className="Port LeftPort"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <Icon name="arrow-right-drop-circle-outline" />
      <div className="label">{name}</div>
    </div>
  )
}

const RightPort: SFC<PortProps> = ({ name, onMouseDown, onMouseUp }) => {
  return (
    <div
      className="Port RightPort"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="label">{name}</div>
      <Icon name="arrow-right-drop-circle-outline" />
    </div>
  )
}

export interface FuncNodeProps {
  node: DisplayFuncNode
  isPreview?: boolean
  containerRef?: (c: HTMLElement | null) => void
  onMouseDownHeader?: (e: MouseEvent<any>, id: NodeId) => void
  onDoubleClickHeader?: (e: MouseEvent<any>, id: NodeId) => void
  onMouseDownInput?: (e: MouseEvent<any>, id: NodeId, index: number) => void
  onMouseUpInput?: (e: MouseEvent<any>, id: NodeId, index: number) => void
  onMouseDownOutput?: (e: MouseEvent<any>, id: NodeId) => void
  onMouseUpOutput?: (e: MouseEvent<any>, id: NodeId) => void
  onDoubleClickBody?: (e: MouseEvent<any>, id: NodeId) => void
  onClickMakeReference?: (e: MouseEvent<any>, id: NodeId) => void
  onClickDupulicate?: (e: MouseEvent<any>, id: NodeId) => void
  onClickRemove?: (e: MouseEvent<any>, id: NodeId) => void
}

const NOP = () => {}

export const FuncNode: SFC<FuncNodeProps> = ({
  node,
  isPreview,
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
  onClickRemove = NOP
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const classes = [
    "Block",
    node.linked && "linked",
    node.isAsync && "async",
    isPreview && "preview"
  ]

  return (
    <div
      className={classes.filter(c => c).join(" ")}
      style={{ left: node.x, top: node.y }}
      ref={c => {
        if (containerRef !== undefined) {
          containerRef(c)
        }
      }}
    >
      <div
        className="header"
        onMouseDown={e => onMouseDownHeader(e, node.id)}
        onDoubleClick={e => {
          e.stopPropagation()
          onDoubleClickHeader(e, node.id)
        }}
      >
        <div className="name">
          {node.linked && <Icon name="link" className="link-icon" />}
          {node.name}
        </div>
        <div
          className="menu-button"
          onDoubleClick={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            isMenuOpened ? setIsMenuOpened(false) : setIsMenuOpened(true)
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
              onClick: e => onClickMakeReference(e, node.id)
            },
            { name: "duplicate", onClick: e => onClickDupulicate(e, node.id) },
            { name: "remove", onClick: e => onClickRemove(e, node.id) }
          ]}
          onRequestClose={() => setIsMenuOpened(false)}
        />
      )}
      <div className="ports">
        <div className="inputs">
          {node.inputNames.map((name, i) => (
            <LeftPort
              name={name}
              key={i}
              onMouseDown={e => onMouseDownInput(e, node.id, i)}
              onMouseUp={e => onMouseUpInput(e, node.id, i)}
            />
          ))}
        </div>
        <div className="outputs">
          <RightPort
            name=""
            onMouseDown={e => onMouseDownOutput(e, node.id)}
            onMouseUp={e => onMouseUpOutput(e, node.id)}
          />
        </div>
      </div>
      {!node.linked && (
        <pre
          className="code"
          onDoubleClick={e => onDoubleClickBody(e, node.id)}
        >
          {node.code}
        </pre>
      )}
    </div>
  )
}
