/* eslint-disable no-undef */
const loginForm = document.getElementById('loginForm')
const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const errorMessage = document.getElementById('error-message')

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
        errorMessage.textContent = 'O usuário ou a senha inserida está incorreta.'
      } else {
        console.error('Erro na solicitação:', error)
      }
    })
})
