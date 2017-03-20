export default {
  blocks: [
    {
      name: "constant",
      code: "() => 1",
      x: 20,
      y: 20
    },
    {
      name: "constant2",
      code: "() => 2",
      x: 20,
      y: 180
    },
    {
      name: "add",
      code: "(a, b) => a + b",
      x: 180 * 2,
      y: 20
    },
    {
      name: "popup",
      code: `str => alert(str)`,
      x: 180 * 3,
      y: 20
    },
    {
      name: "double",
      code: `x => x * 2`,
      x: 180 * 3,
      y: 180
    },
    {
      link: 4,
      x: 180,
      y: 180
    },
    {
      link: 4,
      x: 180,
      y: 20
    }
  ],
  edges: [
    {
      fromId: 0,
      toId: 6,
      toIndex: 0
    },
    {
      fromId: 1,
      toId: 5,
      toIndex: 0
    },
    {
      fromId: 6,
      toId: 2,
      toIndex: 0
    },
    {
      fromId: 5,
      toId: 2,
      toIndex: 1
    },
    {
      fromId: 2,
      toId: 3,
      toIndex: 0
    },
  ]
}
