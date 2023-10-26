const express = require('express')
const router = express.Router()
const Joi = require('joi')
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const db = require('../db.js')

const creditoEsquema = Joi.object({
  maquina: Joi.number().integer().min(0).required(),
  senha: Joi.number().integer().min(0).required(),
  produto: Joi.number().integer().min(0).required(),
  quantidade: Joi.number().integer().min(0).required()
})

router.post('/credito', async (req, res) => {
  const validationResult = creditoEsquema.validate(req.body)
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message)
    return
  }

  try {
    const auth = await db.query('SELECT id FROM maquinas WHERE id = $1 AND senha = $2', [req.body.maquina, req.body.senha])
    if (auth.rowCount === 0) {
      res.sendStatus(401)
      return
    }
    const produto = await db.query('SELECT * from produtos WHERE id = $1', [req.body.produto])
    if (produto.rowCount === 0) {
      res.sendStatus(400)
      return
    }
    const estoque = await db.query('SELECT * from estoque WHERE maquina_id = $1 AND produto_id = $2', [req.body.maquina, req.body.produto])
    if (estoque.rowCount === 0) {
      await db.query('INSERT into estoque(maquina_id, produto_id, quantidade) VALUES($1, $2, $3)', [req.body.maquina, req.body.produto, req.body.quantidade])
      res.sendStatus(200)
      return
    }
    await db.query('UPDATE estoque SET quantidade = $1 WHERE maquina_id = $2 AND produto_id = $3', [req.body.quantidade, req.body.maquina, req.body.produto])
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})

module.exports = router
