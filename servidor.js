const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const getExtrato = require('./routes/getExtrato')
const postCredito = require('./routes/postCredito')
const postDebito = require('./routes/postDebito')
const postEstoque = require('./routes/postEstoque')
const getEstoque = require('./routes/getEstoque')

app.use('/api/v1', getExtrato)
app.use('/api/v1', postCredito)
app.use('/api/v1', postDebito)
app.use('/api/v1', postEstoque)
app.use('/api/v1', getEstoque)
app.listen(port, () => { console.log(`Server running at http://localhost:${port}/`) })
