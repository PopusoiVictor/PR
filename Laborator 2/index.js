const {exec} = require('child_process')
var fs = require('fs')
var count = 0,
  nr = 0
var categories = [],
  orders = []
var done = function (next) {
  console.log('All done')
  next()
}
function fireFileRead () {
  nr++
  if (2 == nr)
    doneFileRead()
}
function fired (err, stdout, stderr) {
  console.log(stdout)
  count++
  if (2 == count)
    done(function () {
      fs.readFile('./orders.csv', function (e, data) {
        data = data.toString()
        var csv_data = data.split(/\r?\n|\r/)
        csv_data = csv_data.map(k => k.split(','))
        orders = csv_data
        fireFileRead()
      })
      fs.readFile('./categories.csv', function (e, data) {
        data = data.toString().trim()
        var csv_data = data.split(/\r?\n|\r/)
        csv_data = csv_data.map(k => k.split(','))
        categories = csv_data
        fireFileRead()
      })
    })
}
function cat () {this.orders = [];}
cat.prototype.toString = function catToString () {
  return '[' + this.categoryId + ' ' + this.name + ' ' + this.parentId + `]`
}
function doneFileRead () {
  var arr = [categories, orders]
  var filterResult = categories.filter(n => !n[2])
  var k = new Tree()
  var x = filterResult
  k.add('ROOT')
  var groupe = []
  for (var m in x) {
    var nx = new cat()
    nx.categoryId = x[m][0]
    nx.name = x[m][1]
    nx.parentId = x[m][2]
    nx.level = 1
    groupe[x[m][0]] = nx
    k.add(nx, 'ROOT')
  }
  categories.forEach(c => {
    var p_id = c[2]
    if (groupe[p_id]) {
      var nx = new cat()
      nx.categoryId = c[0]
      nx.name = c[1]
      nx.parentId = c[2]
      nx.level = groupe[p_id].level + 4
      groupe[c[0]] = nx
      k.add(nx, groupe[p_id])
    }
  })
  categories.filter(g => !groupe[g[0]]).forEach(c => {
    var p_id = c[2]
    if (groupe[p_id]) {
      var nx = new cat()
      nx.categoryId = c[0]
      nx.name = c[1]
      nx.parentId = c[2]
      nx.level = groupe[p_id].level + 4
      groupe[c[0]] = nx
      k.add(nx, groupe[p_id])
    }
  })
  categories.filter(g => !groupe[g[0]]).forEach(c => {
    var p_id = c[2]
    if (groupe[p_id]) {
      var nx = new cat()
      nx.categoryId = c[0]
      nx.name = c[1]
      nx.parentId = c[2]
      nx.level = groupe[p_id].level + 4
      groupe[c[0]] = nx
      k.add(nx, groupe[p_id])
    }
  })
  console.log(categories[0])
  console.log(orders[0])
  orders.forEach(n => {
    if (!groupe[n[2]]) {
      return
    }
    groupe[n[2]].orders.push(n)
  })
  console.log(x)
  k.traverseDFS(function (r) {
    console.log(' '.repeat(r.data.level) + r.data.toString())
  })
  return
  for (var c in categories) {
    for (var n in x) {
      if (categories[c][2] == n[1]) {
        filterResult.push(categories[c])
        k.add(categories)
      }
    }
  }
  console.log(k)
}
exec('node src/main/reqOrders.js', fired)
exec('node src/main/reqCategories.js', fired)
function Node (data) {
  this.data = data
  this.children = []
}
function Tree () {
  this.root = null
}
Tree.prototype.add = function (data, toNodeData) {
  var node = new Node(data)
  var parent = toNodeData
    ? this.findBFS(toNodeData)
    : null
  if (parent) {
    parent
      .children
      .push(node)
  } else {
    if (!this.root) {
      this.root = node
    } else {
      return 'Root node is already assigned'
    }
  }
}
Tree.prototype.findBFS = function (data) {
  var queue = [this.root]
  while (queue.length) {
    var node = queue.shift()
    if (node.data === data) {
      return node
    }
    for (var i = 0; i < node.children.length; i++) {
      queue.push(node.children[i])
    }
  }
  return null
}
Tree.prototype._preOrder = function (node, fn) {
  if (node) {
    if (fn) {
      fn(node)
    }
    for (var i = 0; i < node.children.length; i++) {
      this._preOrder(node.children[i], fn)
    }
  }
}
Tree.prototype._postOrder = function (node, fn) {
  if (node) {
    for (var i = 0; i < node.children.length; i++) {
      this._postOrder(node.children[i], fn)
    }
    if (fn) {
      fn(node)
    }
  }
}
Tree.prototype.traverseDFS = function (fn, method) {
  var current = this.root
  if (method) {
    this['_' + method](current, fn)
  } else {
    this._preOrder(current, fn)
  }
}