const express = require('express')
const router = express.Router()
const Joi = require('joi')
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const db = require('../db.js')

const creditoEsquema = Joi.object({
  maquina: Joi.number().integer().min(0).required(),
  senha: Joi.number().integer().min(0).required()
})

router.get('/getEstoque', async (req, res) => {
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

    let estoque = await db.query('SELECT * from estoque WHERE maquina_id = $1', [req.body.maquina])
    estoque = { estoque: estoque.rows }

    res.json(estoque)
  } catch (err) {
    res.sendStatus(500)
  }
})

module.exports = router
