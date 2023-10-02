const Client = require('pg').Client
const cliente = new Client({
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE
})

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function escolha () {
  rl.question('Você Deseja CADASTRAR ou VER: ', (userInput) => {
    if (userInput.toUpperCase() === 'CADASTRAR') {
      rl.question('Qual Produto Deseja Cadastrar: ', (produto) => {
        rl.question('Quantos tijolos ele custa: ', (preco) => {
          insProduto(produto, preco)
          rl.close()
        })
      })
    } else if (userInput.toUpperCase() === 'VER') {
      rl.question('Voce quer ver: despesas, estoque, jogador, jogo, maquina, produto ou receitas? \n  (Escolha entre um desses valores) \nR: ', (escolhida) => {
        getEstoque(escolhida.toLowerCase())
        rl.close()
      })
    } else {
      console.log('Opção inválida. Por favor, escolha entre CADASTRAR ou VER.')
      // askUser()
    }
  })
}
escolha()

async function getEstoque (tabela) {
  try {
    console.log('iniciando a conexão.')
    await cliente.connect()
    console.log('Conexão bem sucedida!')
    const resultado = await cliente.query('select * from ' + tabela)
    console.table(resultado.rows)
  } catch (ex) {
    console.log('Ocorreu um erro no getEstoque, o erro é:' + ex)
  } finally {
    await cliente.end()
    console.log('Cliente Desconectado.')
  }
}

async function insProduto (produto, preco) {
  try {
    console.log('iniciando a conexão.')
    await cliente.connect()
    console.log('Conexão bem sucedida!')
    await cliente.query("insert into produto(descricao,valor) values('" + produto + "', '" + preco + "');")

    const resultado = await cliente.query('select * from produto')
    console.log('Produto adicionado com sucesso')
    console.table(resultado.rows)
  } catch (ex) {
    console.log('Ocorreu um erro no insProduto, o erro é:' + ex)
  } finally {
    await cliente.end()
    console.log('Cliente Desconectado.')
  }
}
