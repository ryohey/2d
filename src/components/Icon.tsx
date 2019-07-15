import React, { SFC } from "react"

import e from "../helpers/getElementType"
import classnames from "classnames"

import "./Icon.css"
import "mdi/css/materialdesignicons.css"

export interface IconProps {
  component?: any
  name: string
  className?: string
}

const Icon: SFC<IconProps> = ({ component, name, className }) => {
  const ElementType = e(component)
  return (
    <ElementType
      className={classnames("Icon", "mdi", `mdi-${name}`, className)}
    />
  )
}

export default Icon
