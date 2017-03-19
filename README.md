## Graph to Script

座標がコメントとして付加される

```js
/*
  { x: 24, y: 52 }
 */
function add(a, b) {
  return a + b
}
```

名前が付いていない場合は自動的に連番が振られる

```js
/*
  { x: 10, y: 10 }
 */
function _1() {
  return 1
}
```

グラフ全体は main 関数として生成される

```js
function main() {
  const out1 = _1()
  const out2 = _1()
  const out3 = add(out1, out2)
  const out4 = sub(out1, out3)
}
```
