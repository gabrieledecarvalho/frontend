const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const routeExtrato = require('./routes/extrato')
const routeCredito = require('./routes/credito')
const routeDebito = require('./routes/debito')
const routepostEstoque = require('./routes/postEstoque')

app.use('/api/v1', routeExtrato)
app.use('/api/v1', routeCredito)
app.use('/api/v1', routeDebito)
app.use('/api/v1', routepostEstoque)
app.listen(port, () => { console.log(`Server running at http://localhost:${port}/`) })
