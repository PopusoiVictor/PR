'use strict'
const net = require('net')
const readline = require('readline')
const socket = new net.Socket()
socket.setEncoding('utf8')
let username = ''
let password = ''
function displayMessage (rl, msg) {
  process
    .stdout
    .clearLine()
  process
    .stdout
    .cursorTo(0)
  console.log(msg)
  rl.prompt(true)
}
function xorEncryption (str, key) {
  let out = ''
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    out += String.fromCharCode(charCode)
  }
  return out
}
const rl = readline.createInterface({input: process.stdin, output: process.stdout, prompt: '> '})
const description = {
  '/help': 'Responds with a list of supported commands',
  '/hello <parameter>': 'Responds with the text that has been shipped as a parameter',
  '/username': 'Change username',
  '/password': 'Change password',
  '/date': 'Show current date',
  '/exit': 'Disconnects from the server'
}
function showObject (obj) {
  var result = ''
  for (var x in obj) {
    if (obj.hasOwnProperty(x)) {
      result += x + ' - ' + obj[x] + '\n'
    }
  }
  return result
}
const commands = {
  '/help': (command) => {
    displayMessage(rl, '\nAvailable commands:\n' + showObject(description))
  },
  '/username': (command) => {
    const oldUsername = username
    username = command.split(' ')[1]
    displayMessage(rl, 'Username is changed')
    socket.write(JSON.stringify({type: 'username', username: oldUsername, data: username}), 'utf8')
  },
  '/password': (command) => {
    password = command.split(' ')[1]
    displayMessage(rl, 'Password is changed')
  },
  '/exit': (command) => {
    rl.close()
  },
  '/hello': (command) => {
    const text = command.split(' ')[1]
    displayMessage(rl, text)
  },
  '/date': (command) => {
    displayMessage(rl, new Date())
  }
}
rl.question('Choose your username: ', (answer) => {
  console.log(`Username set to: ${answer}`)
  username = answer
  rl.question('Type password for encryption: ', (pass) => {
    console.log(`Password set to: ${pass}`)
    password = pass
    socket.connect({
      port: 8080,
      host: 'localhost'
    }, () => socket.write(JSON.stringify({type: 'connect', username}), 'utf8'))
    console.log('Connected to server on localhost: 8080')
    rl.prompt(true)
  })
})
socket.on('data', (data) => {
  const msg = JSON.parse(data)
  switch (msg.type) {
    case 'public-chat':
      displayMessage(rl, `<${msg.username}> ${xorEncryption(msg.data, password)}`)
      break
    case 'connect':
      displayMessage(rl, `${msg.username} joined chat!`)
      break
    case 'disconnect':
      displayMessage(rl, `${msg.username} leaved chat!`)
      break
    case 'username':
      displayMessage(rl, `${msg.username} changed username to ${msg.data}`)
      break
    case 'bad-connect-username':
      displayMessage(rl, `Username ${msg.username} is already used`)
      rl.question('Choose your username: ', (answer) => {
        console.log(`Username set to: ${answer}`)
        username = answer
        socket.write(JSON.stringify({type: 'connect', username}), 'utf8')
        rl.prompt(true)
      })
      break
    case 'bad-username':
      displayMessage(rl, `Username ${msg.username} is already used`)
      displayMessage(rl, 'Change username using command /username')
      break
    default:
      break
  }
})
rl.on('line', (line) => {
  line = line.trim()
  const command = commands[line.split(' ')[0]]
  if (command) {
    command(line)
  } else {
    if (command !== Object.keys(commands)) {
      displayMessage(rl, 'Ouch! Invalid command. Did you mean:\n' + Object.keys(commands).join('\n'))
    }
    socket.write(JSON.stringify({
      type: 'public-chat',
      username,
      data: xorEncryption(line, password)
    }), 'utf8')
  }
  rl.prompt()
})
rl.on('close', () => {
  displayMessage(rl, 'Goodbye!')
  socket.write(JSON.stringify({type: 'disconnect', username}), 'utf8')
  socket.destroy()
  process.exit(0)
})
