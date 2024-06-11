import { FormEvent, useState } from 'react';
import './App.css';

function App() {
  const [res, setRes] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
   
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${e.currentTarget.username.value}&password=${e.currentTarget.password.value}`,
    });
    const resBody = await res.json()
    setRes(resBody)
    
  }
  return (

    <>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <label>
        <span>Username</span>
        <input type="text" name="username" required value="Jim" />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required value={'123'} />
      </label>
      <button type="submit">Login</button>
    </form>
    <h1>Response: {res}</h1>
    </>
  )
}

export default App
