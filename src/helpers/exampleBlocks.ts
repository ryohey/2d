import { IGraph } from "../types"

const graph: IGraph = {
  nodes: [
    {
      type: "CodeBlock",
      name: "constant",
      code: "() => 1",
      x: 44,
      y: 26,
      id: 0
    },
    {
      type: "CodeBlock",
      name: "time",
      code: "() => 1000",
      x: 49,
      y: 165,
      id: 8
    },
    {
      type: "CodeBlock",
      name: "delay",
      code:
        "(value, delay) => new Promise((resolve, reject) => {\n  setTimeout(() => resolve(value), delay)\n})",
      x: 183,
      y: 26,
      isAsync: true,
      id: 7
    },
    {
      type: "CodeBlock",
      name: "constant2",
      code: "() => 2",
      x: 367,
      y: 110,
      id: 1
    },
    {
      type: "CodeBlock",
      name: "time2",
      code: "() => 2000",
      x: 377,
      y: 247,
      id: 10
    },
    {
      type: "CodeBlock",
      reference: 2,
      x: 518,
      y: 111,
      id: 9
    },
    {
      type: "CodeBlock",
      id: 11,
      x: 650.6666564941406,
      y: 26,
      name: "add",
      code: "(a, b) => a + b"
    },
    {
      type: "CodeBlock",
      name: "popup",
      code: "str => alert(str)",
      x: 815,
      y: 27,
      id: 3
    }
  ],
  edges: [
    {
      fromId: 0,
      toId: 2,
      toIndex: 0
    },
    {
      fromId: 1,
      toId: 2,
      toIndex: 1
    },
    {
      fromId: 3,
      toId: 5,
      toIndex: 0
    },
    {
      fromId: 4,
      toId: 5,
      toIndex: 1
    },
    {
      fromId: 5,
      toId: 6,
      toIndex: 1
    },
    {
      fromId: 2,
      toId: 6,
      toIndex: 0
    },
    {
      fromId: 6,
      toId: 7,
      toIndex: 0
    }
  ]
}

export default graph
