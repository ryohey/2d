import React, { SFC, MouseEvent, useState } from "react"
import Icon from "../components/Icon"
import "./FuncNode.css"
import { DisplayFuncNode } from "../types"
import { DropDownMenu } from "../components/DropDownMenu"
import { NodeId } from "../topology/Graph"
import { GraphStore } from "../stores/GraphStore"
import { DragTrigger } from "../components/Drag"

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
  graphStore: GraphStore
  node: DisplayFuncNode
  isPreview?: boolean
  containerRef?: (c: HTMLElement | null) => void
}

export const FuncNode: SFC<FuncNodeProps> = ({
  graphStore,
  node,
  isPreview,
  containerRef
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const classes = [
    "Block",
    node.linked && "linked",
    node.isAsync && "async",
    isPreview && "preview"
  ]

  const openModal = () => {
    graphStore.editingNode = node
  }

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
      <DragTrigger
        className="header"
        data={node}
        onDoubleClick={e => {
          e.stopPropagation()
          openModal()
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
      </DragTrigger>
      {isMenuOpened && (
        <DropDownMenu
          items={[
            {
              name: "make reference",
              onClick: e => graphStore.createReferenceFuncNode(node.id)
            },
            {
              name: "duplicate",
              onClick: e => graphStore.dupulicateNode(node.id)
            },
            { name: "remove", onClick: e => graphStore.removeNode(node.id) }
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
              onMouseDown={e => {}}
              onMouseUp={e => graphStore.endDragOnNodeInput(node.id, i)}
            />
          ))}
        </div>
        <div className="outputs">
          <RightPort
            name=""
            onMouseDown={e => graphStore.startDragOnNodeOutput(node.id)}
            onMouseUp={e => graphStore.endDragOnNodeOutput()}
          />
        </div>
      </div>
      {!node.linked && (
        <pre className="code" onDoubleClick={openModal}>
          {node.code}
        </pre>
      )}
    </div>
  )
}
