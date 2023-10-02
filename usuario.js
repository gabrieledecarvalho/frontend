const { Client } = require('pg')

const cliente = new Client({
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE
})

let DinherioSuficiente
let valorProduto
let produtoId
let idValidos = []
const email = 'leojn132013@gmail.com'
const senha = 'senhaadm'

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function connectClient () {
  try {
    await cliente.connect()
  } catch (error) {
    console.log(error)
    rl.close()
  }
}

async function obterReceitas (table) {
  try {
    const resultado = await cliente.query('SELECT SUM(valor) FROM receitas WHERE jogador_id = (SELECT id FROM jogador WHERE email = $1 AND senha = $2)', [email, senha])
    const receitasCompletas = await cliente.query("SELECT jogador.apelido AS usuario, jogo.nome as Nome_do_jogo, receitas.valor, to_char(receitas.data, 'DD/MM/YYYY HH24:MI:SS') as data FROM receitas INNER JOIN jogador ON jogador.id = receitas.jogador_id INNER JOIN jogo ON jogo.id = receitas.jogo_id WHERE receitas.jogador_id = (SELECT id FROM jogador WHERE email = $1 and senha = $2);", [email, senha])
    if (!table) {
      return parseInt(resultado.rows[0].sum)
    } else if (table) {
      return receitasCompletas
    }
  } catch (ex) {
    console.log('Ocorreu um erro ao obter as receitas, o erro é: ' + ex)
    return 0
  }
}

async function obterDespesas (table) {
  try {
    const resultado = await cliente.query('SELECT SUM(valor) FROM despesas WHERE jogador_id = (SELECT id FROM jogador WHERE email = $1 AND senha = $2)', [email, senha])
    const despesasCompletas = await cliente.query("SELECT jogador.apelido AS usuario, produto.descricao as produto, despesas.valor, to_char(despesas.data, 'DD/MM/YYYY HH24:MI:SS') as data FROM despesas INNER JOIN jogador ON jogador.id = despesas.jogador_id INNER JOIN produto ON produto.id = despesas.produtoId WHERE despesas.jogador_id = (SELECT id FROM jogador WHERE email = 'leojn132013@gmail.com'and senha = 'senhaadm');")
    // console.log(parseInt(resultado.rows[0].sum));
    if (!table) {
      return parseInt(resultado.rows[0].sum)
    } else if (table) {
      return despesasCompletas
    }
  } catch (ex) {
    console.log('Ocorreu um erro ao obter as despesas, o erro é: ' + ex)
    return 0
  }
}

async function getProdutos () {
  try {
    const resultado = await cliente.query('SELECT * FROM produto WHERE id IN (SELECT produtoId FROM estoque WHERE quantidade > 0);')
    console.table(resultado.rows)
    idValidos = []
    resultado.rows.forEach(row => {
      idValidos.push(parseInt(row.id, 10))
    })

    // console.log(idValidos);
  } catch (ex) {
    console.log('Ocorreu um erro no getProdutos, o erro é:' + ex)
  }
}

async function comprarProduto (id) {
  try {
    const valorProdutoBruto = await cliente.query('SELECT valor FROM produto WHERE id = $1', [id])
    valorProduto = parseInt(valorProdutoBruto.rows[0].valor)
    console.log('O valor do produto é de ' + valorProduto + ' Tijolinhos')

    const receitas = await obterReceitas(false)
    const despesas = await obterDespesas(false)

    console.log('Seu saldo atual é de ' + (receitas - despesas) + ' Tijolinhos')

    if ((receitas - despesas) > valorProduto) {
      DinherioSuficiente = true
    } else {
      DinherioSuficiente = false
      console.log('Você não tem tijolinhos suficientes para finalizar a compra')
      rl.close()
    }
  } catch (ex) {
    console.log('Ocorreu um erro no comprarProduto, o erro é:' + ex)
  }
}

async function finalizarCompra () {
  try {
    const dataAtual = new Date()
    const dataFormatada = formatarData(dataAtual)
    await cliente.query("insert into despesas(jogador_id,produtoId,valor,data) VALUES((SELECT id FROM jogador WHERE email = '" + email + "'and senha = '" + senha + "')," + produtoId + ',' + valorProduto + ",'" + dataFormatada + "');")
    await cliente.query('update estoque set quantidade = quantidade - 1 WHERE produtoId =' + produtoId + ' ;')
    const receitasFinal = await obterReceitas(false)
    const despesasFinal = await obterDespesas(false)
    console.log('Seu saldo atual é de: ' + (receitasFinal - despesasFinal) + ' Tijolinhos')
    cliente.end()
    rl.close()
  } catch (ex) {
    console.log('Ocorreu um erro no finalizar compra, o erro é:' + ex)
  }
}

function escolha () {
  rl.question('Você Deseja: comprarProduto(1), Ver_Receitas(2), Ver_Despesas(3), Ver_Extrato(4), Sair(5)? \nR: ', async (userInput) => {
    if (userInput === '1') {
      await getProdutos()
      console.log('Insira o ID do Produto')
      rl.question('R:', async (idProduto) => {
        produtoId = parseInt(idProduto)
        if (idValidos.includes(produtoId)) {
          console.log(produtoId)
          await comprarProduto(produtoId)
          if (DinherioSuficiente) {
            rl.question('Você deseja Concluir a compra? Sim(1) Não(2) \nR: ', async (confirmacao) => {
              if (confirmacao === '1') {
                await finalizarCompra()
                rl.close()
              } else {
                rl.question('Você deseja: Sair(1) ou Voltar_ao_Início(2)? \nR: ', (respostaDoUsr) => {
                  if (respostaDoUsr === '2') {
                    escolha()
                  } else {
                    rl.close()
                  }
                })
              }
            })
          }
        } else {
          console.log('\x1b[34mID Inválido')
          console.log('\x1b[0m')
          escolha()
        }
      })
    } else if (userInput === '2') {
      obterReceitas(true)
        .then((resultado) => {
          console.table(resultado.rows)
          cliente.end()
          rl.close()
        })
    } else if (userInput === '3') {
      obterDespesas(true)
        .then((resultado) => {
          console.table(resultado.rows)
          cliente.end()
          rl.close()
        })
        .catch((error) => console.error(error))
    } else if (userInput === '4') {
      console.log('Ainda em Desenvolvimento')
      rl.close()
      cliente.end()
    } else {
      rl.close()
      cliente.end()
    }
  })
}

function formatarData (data) {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`
}
connectClient()
escolha()
