const express = require('express')
const { Pool } = require('pg')
const Joi = require('joi')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000
const pool = new Pool() // usadas as variáveis de ambiente conforme https://www.postgresql.org/docs/9.1/libpq-envars.html

app.use(bodyParser.json())
const jogadorSchema = Joi.object({
  apelido: Joi.string().min(3).required(),
  senha: Joi.number().integer().min(0)
})

// curl -X GET -H 'Content-Type: application/json' -d '{"apelido": "abcd", "senha": "1234"}' http://localhost:3000/jogador
app.get('/jogador', async (req, res) => {
  const validationResult = jogadorSchema.validate(req.body)
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message)
    return
  }

  try {
    const result = await pool.query(
      'SELECT * FROM jogador WHERE apelido = $1 AND senha = $2',
      [req.body.apelido, req.body.senha]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).send('Database error')
  }
})

app.listen(port, () => { console.log(`Server running at http://localhost:${port}/`) })
