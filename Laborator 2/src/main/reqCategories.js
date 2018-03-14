var http = require('http')
var fs = require('fs')
var options = {
  host: 'evil-legacy-service.herokuapp.com',
  path: '/api/v101/categories/?start=2018-03-01&end=2018-03-30',
  headers: {
    'x-api-key': '55193451-1409-4729-9cd4-7c65d63b8e76',
    'accept': 'text/csv'
  }
}
var request = http.request(options, function (res) {
  var data = ''
  res.on('data', function (chunk) {
    data += chunk
  })
  res.on('end', function (response) {
    console.log(data)
    fs.writeFile('./categories.csv', data, (err) => {
      if (err) {
        return console.log(err)
      }
    })
  })
})
request.on('error', function (err) {
  console.log(err)
})
request.end()
