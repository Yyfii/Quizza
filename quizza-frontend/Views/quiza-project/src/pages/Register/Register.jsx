import { useEffect, useRef, useState } from 'react'
import Trash from '../../assets/trash.png'
import api from '../../services/api'
import './register-style.css'


//react Hook - useRef : it´s possible to use a reference
function Register() {

  const [users, setUsers] = useState([])
  const inputName = useRef()
  const inputAge = useRef()
  const inputEmail = useRef()

  // async -> something that rely on something that is outside of the code. How much does it take to make that connection?
  //Get Function
  async function getUsers(){
    const usersFromApi = await api.get('/users')
    setUsers(usersFromApi.data)
    console.log(users)
  }

  //Create Function
  async function createUsers(){
    await api.post('/users', {
      name: inputName.current.value,
      age: inputAge.current.value,
      email: inputEmail.current.value
    })

    getUsers()
  }
  
  //Delete Function
  async function deleteUsers(id){
    await api.delete(`/users/${id}`)

    getUsers()
  }

  
  // Every time the page is loaded/opened
  useEffect(() => {
    getUsers()
  }, [])

  return (
      <div className='container'>
        <form>
          <h1>Cadastro de Usuários</h1>
          <input placeholder='Nome' type="text" name='name' ref={inputName}/>
          <input placeholder='Idade' type="number" name='age' ref={inputAge}/>
          <input placeholder='E-mail' type="email" name='email' ref={inputEmail}/>
          <button type='button' onClick={createUsers}>Cadastrar</button>
        </form>

        {users.map(user =>(
          <div key={user.id} className='card'>
          <div>
            <p>Nome: <span>{user.name}</span></p>
            <p>Idade: <span>{user.age}</span></p>
            <p>Email: <span>{user.email}</span></p>
          </div>
          <button onClick={() => deleteUsers(user.id)}>
            <img src={Trash}/>
          </button>
        </div>
        ))}
        
      </div>
  )
}

export default Register
