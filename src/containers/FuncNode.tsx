import React, { FC, useState } from "react"
import { DragTrigger } from "../components/Drag"
import { DropDownMenu } from "../components/DropDownMenu"
import Icon from "../components/Icon"
import { useAppDispatch } from "../hooks"
import {
  addReferenceFuncNode,
  dupulicateNode,
  removeNode,
  setEditingNode,
} from "../stores/GraphStore"
import { DisplayFuncNode } from "../types"
import "./FuncNode.css"

export interface PortProps {
  name: string
  dragData: any
}

const LeftPort: FC<PortProps> = ({ name, dragData }) => {
  return (
    <DragTrigger data={dragData} className="Port LeftPort">
      <Icon name="arrow-right-drop-circle-outline" />
      <div className="label">{name}</div>
    </DragTrigger>
  )
}

const RightPort: FC<PortProps> = ({ name, dragData }) => {
  return (
    <DragTrigger data={dragData} className="Port RightPort">
      <div className="label">{name}</div>
      <Icon name="arrow-right-drop-circle-outline" />
    </DragTrigger>
  )
}

export interface FuncNodeProps {
  node: DisplayFuncNode
  isPreview?: boolean
  containerRef?: (c: HTMLElement | null) => void
}

export const FuncNode: FC<FuncNodeProps> = ({
  node,
  isPreview,
  containerRef,
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false)
  const dispatch = useAppDispatch()

  const classes = [
    "Block",
    node.linked && "linked",
    node.isAsync && "async",
    isPreview && "preview",
  ]

  const openModal = () => {
    dispatch(setEditingNode(node))
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
              onClick: (e) => dispatch(addReferenceFuncNode(node.id)),
            },
            {
              name: "duplicate",
              onClick: (e) => dispatch(dupulicateNode(node.id)),
            },
            {
              name: "remove",
              onClick: (e) => dispatch(removeNode(node.id)),
            },
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
