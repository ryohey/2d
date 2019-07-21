import React, { SFC } from "react"
import { IVariableNode } from "../types"
import styled from "styled-components"

interface VariableNodeProps {
  node: IVariableNode
}

const Container = styled.div`
  position: absolute;
`

export const VariableNode: SFC<VariableNodeProps> = ({ node }) => {
  return (
    <Container style={{ left: node.x, top: node.y }}>{node.name}</Container>
  )
}
