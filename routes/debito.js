const express = require('express')
const router = express.Router()
const Joi = require('joi')
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const { Pool } = require('pg')

const pool = new Pool({
  user: "postgres",
  password: "1308",
  host: "127.0.0.1",
  port: 5433,
  database: "feira"
});

    const debitoEsquema = Joi.object({
    id: Joi.number().integer().min(0).required(),
    senha: Joi.number().integer().min(0).required(),
    produto: Joi.number().integer().min(0).required(),
    valor: Joi.number().integer().min(1).required()
  })
  
    router.post('/debito', async (req, res) => {
    const validationResult = debitoEsquema.validate(req.body);
    if (validationResult.error) {
      res.status(400).send(validationResult.error.details[0].message);
      return;
    }
    try {
      const auth = await pool.query('SELECT id FROM jogadores WHERE id = $1 AND senha = $2', [req.body.id, req.body.senha])
      if (auth.rowCount === 0) {
        res.sendStatus(401)
        return
      }
  
      let receitas = await pool.query('SELECT COALESCE(SUM(valor), 0) FROM receitas WHERE jogador_id = (SELECT id FROM jogadores WHERE id = $1 AND senha = $2)', [req.body.id, req.body.senha]);
      receitas = parseInt(receitas.rows[0].sum);
      let despesas = await pool.query('SELECT COALESCE(SUM(valor), 0) FROM despesas WHERE jogador_id = (SELECT id FROM jogadores WHERE id = $1 AND senha = $2)', [req.body.id, req.body.senha]);
      despesas = parseInt(despesas.rows[0].sum);
      let produto = await pool.query('SELECT * FROM produtos where id = $1', [req.body.produto]);
      let valorProduto =  await pool.query("select valor from produtos where id =" + req.body.produto);
      valorProduto = parseInt(valorProduto.rows[0].valor);

      if (produto.rowCount === 0) {
        res.sendStatus(400)
        return
      }

      if (req.body.valor != valorProduto) {
        res.sendStatus(400)
        return
      }

      if ((receitas-despesas) < req.body.valor) {
        res.sendStatus(403)
        return
      }
      
      await pool.query('insert into despesas(jogador_id,produto_id,valor,data) values((select id from jogadores where id = $1 and senha = $2), $3, $4, NOW())', [req.body.id, req.body.senha, req.body.produto,req.body.valor]);
      await pool.query('update estoque set quantidade = quantidade - 1 where produto_id = $1;', [req.body.produto])
      res.status(200).send('OK')

    } catch (error) {
      res.status(500).send('Database error')
    }
     
   })

   module.exports = router