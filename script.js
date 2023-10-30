/* eslint-disable no-undef */
const loginForm = document.getElementById('loginForm')
const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')

loginForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const username = usernameInput.value
  const password = passwordInput.value

  axios.post('/api/v1/extrato', {
    id: username,
    senha: password
  })
    .then(response => {
      console.log('Resposta do servidor:', response.data)
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        alert('Erro 401') // Exibe um alert quando o status da resposta for 401.
      } else {
        console.error('Erro na solicitação:', error)
      }
    })
})
