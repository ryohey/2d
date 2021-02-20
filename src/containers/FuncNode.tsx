import React, { SFC, useState } from "react"
import Icon from "../components/Icon"
import "./FuncNode.css"
import { DisplayFuncNode } from "../types"
import { DropDownMenu } from "../components/DropDownMenu"
import { GraphStore } from "../stores/GraphStore"
import { DragTrigger } from "../components/Drag"

export interface PortProps {
  name: string
  dragData: any
}

const LeftPort: SFC<PortProps> = ({ name, dragData }) => {
  return (
    <DragTrigger data={dragData} className="Port LeftPort">
      <Icon name="arrow-right-drop-circle-outline" />
      <div className="label">{name}</div>
    </DragTrigger>
  )
}

const RightPort: SFC<PortProps> = ({ name, dragData }) => {
  return (
    <DragTrigger data={dragData} className="Port RightPort">
      <div className="label">{name}</div>
      <Icon name="arrow-right-drop-circle-outline" />
    </DragTrigger>
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
  containerRef,
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const classes = [
    "Block",
    node.linked && "linked",
    node.isAsync && "async",
    isPreview && "preview",
  ]

  const openModal = () => {
    graphStore.editingNode = node
  }

  return (
    <div
      className={classes.filter((c) => c).join(" ")}
      style={{ left: node.x, top: node.y }}
      ref={(c) => {
        if (containerRef !== undefined) {
          containerRef(c)
        }
      }}
    >
      <DragTrigger
        className="header"
        data={{ node, type: "FuncNodeHeader" }}
        onDoubleClick={(e) => {
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
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => {
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
              onClick: (e) => graphStore.createReferenceFuncNode(node.id),
            },
            {
              name: "duplicate",
              onClick: (e) => graphStore.dupulicateNode(node.id),
            },
            { name: "remove", onClick: (e) => graphStore.removeNode(node.id) },
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
              dragData={{ node, index: i, type: "FuncNodeInput" }}
            />
          ))}
        </div>
        <div className="outputs">
          <RightPort name="" dragData={{ node, type: "FuncNodeOutput" }} />
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
