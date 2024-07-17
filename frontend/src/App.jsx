import React from 'react'
import './App.css'
import CertificateForm from './components/CertificateForm/CertificateForm'

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Certificate Manager</h1>
      </header>
      <CertificateForm />
    </div>
  )
}

export default App
