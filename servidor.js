const express = require('express')
const { Pool } = require('pg')
const Joi = require('joi')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000
const pool = new Pool() // usadas as variáveis de ambiente conforme https://www.postgresql.org/docs/9.1/libpq-envars.html

app.use(bodyParser.json())

const extratoEsquema = Joi.object({
  id: Joi.number().integer().min(1),
  senha: Joi.number().integer().min(0)
})

app.get('/api/v1/extrato', async (req, res) => {
  const validationResult = extratoEsquema.validate(req.body)
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message)
    return
  }

  try {
    const auth = await pool.query('SELECT id FROM jogadores WHERE id = $1 AND senha = $2', [req.body.id, req.body.senha])
    if (auth.rowCount === 0) {
      res.status(401).send('Unauthorized')
      return
    }

    let receitas = await pool.query('SELECT jogos.nome AS jogo, to_char(receitas.data, \'DD/MM/YYYY HH24:MI:SS\') AS data, receitas.valor FROM receitas INNER JOIN jogos ON jogos.id = receitas.jogo_id WHERE receitas.jogador_id = $1', [req.body.id])
    receitas = { receitas: receitas.rows }

    /*
    const receitasTotal = await pool.query('SELECT COALESCE(SUM(valor), 0) AS receitas FROM receitas WHERE jogador_id = (SELECT id FROM jogadores WHERE id = $1 AND senha = $2)', [req.body.id, req.body.senha])
    response = response.concat(receitasTotal.rows)
    */

    let despesas = await pool.query('SELECT produtos.descricao AS produto, to_char(despesas.data, \'DD/MM/YYYY HH24:MI:SS\') AS data, despesas.valor FROM despesas INNER JOIN produtos ON produtos.id = despesas.produto_id WHERE despesas.jogador_id = $1', [req.body.id])
    despesas = { despesas: despesas.rows }

    /*
    const despesasTotal = await pool.query('SELECT COALESCE(SUM(valor), 0) AS despesas FROM despesas WHERE jogador_id = (SELECT id FROM jogadores WHERE id = $1 AND senha = $2)', [req.body.id, req.body.senha])
    response = response.concat(despesasTotal.rows)
    */

    res.json({ ...receitas, ...despesas })
  } catch (err) {
    res.status(500).send('Database error')
  }
})

const creditoEsquema = Joi.object({
  id: Joi.number().integer().min(1),
  senha: Joi.number().integer().min(0),
  jogo: Joi.number().integer().min(1),
  valor: Joi.number().integer().min(1)
})

app.get('/api/v1/credito', async (req, res) => {
  const validationResult = creditoEsquema.validate(req.body)
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message)
    return
  }

  try {
    const auth = await pool.query('SELECT id FROM jogadores WHERE id = $1 AND senha = $2', [req.body.id, req.body.senha])
    if (auth.rowCount === 0) {
      res.status(401).send('Unauthorized')
      return
    }

    const credito = await pool.query('INSERT INTO receitas (jogador_id, jogo_id, valor, data) values ($1, $2, $3, NOW())', [req.body.id, req.body.jogo, req.body.valor])

    res.json(credito)
  } catch (err) {
    res.status(500).send('Database error')
  }
})

app.listen(port, () => { console.log(`Server running at http://localhost:${port}/`) })
