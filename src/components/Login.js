// src/components/Login.js
import React, { useState } from 'react';
import '../styles/Login.css';
import X4Logo from '../assets/x4-logo.png';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Credenciais de acesso hardcoded (em produção, isto deveria vir de um backend seguro)
    const adminCredentials = { username: 'X4GROWTH', password: '@2025x4GROWTH', isAdmin: true };
    const clientCredentials = { username: 'POPDENTS', password: 'POP@2025', isAdmin: false };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      onLogin(adminCredentials);
    } else if (username === clientCredentials.username && password === clientCredentials.password) {
      onLogin(clientCredentials);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          {/* Opção 1: Usando imagem */}
          {/* <img src={X4Logo} alt="X4 Growth Logo" className="logo" /> */}
          
          {/* Opção 2: Usando texto */}
          <h1 className="logo-text">
            <span className="logo-x4">X4</span>
            <span className="logo-growth">GROWTH</span>
          </h1>
        </div>
        <h2>Login Dashboard</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
