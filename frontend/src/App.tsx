import { FormEvent, useState } from 'react'
import './App.css'

function App() {

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const body = `username=${e.currentTarget.username.value}&password=${e.currentTarget.password.value}`
    try {
      const res = await fetch("http://localhost:3000/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      });
      const resBody = await res.json()
      console.log('resBody', resBody)
    } catch (error) {
      console.error("An unexpected error happened occurred:", error);
    }
  }
  return (

    <form onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" required />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required />
      </label>
      <button type="submit">Login</button>
    </form >
  )
}

export default App
