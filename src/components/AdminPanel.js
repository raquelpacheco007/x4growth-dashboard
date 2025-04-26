// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';
import X4Logo from '../assets/x4-logo.png';
import { fetchAdAccounts, fetchClients, addClient, addAdAccount } from '../services/facebookApi';

const AdminPanel = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para formulários
  const [showClientForm, setShowClientForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', username: '', password: '' });
  const [newAdAccount, setNewAdAccount] = useState({ name: '', accountId: '', clientId: '' });

  // Buscar clientes e contas ao carregar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        setClients(clientsData);
        
        if (clientsData.length > 0) {
          setSelectedClient(clientsData[0].id);
        }
        
        const accountsData = await fetchAdAccounts();
        setAdAccounts(accountsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar contas de anúncio por cliente
  const getClientAccounts = () => {
    return adAccounts.filter(account => account.clientId === selectedClient);
  };

  // Adicionar novo cliente
  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const addedClient = await addClient(newClient);
      setClients([...clients, addedClient]);
      setNewClient({ name: '', username: '', password: '' });
      setShowClientForm(false);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      setLoading(false);
    }
  };

  // Adicionar nova conta de anúncio
  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const addedAccount = await addAdAccount({
        ...newAdAccount,
        clientId: selectedClient
      });
      setAdAccounts([...adAccounts, addedAccount]);
      setNewAdAccount({ name: '', accountId: '', clientId: '' });
      setShowAccountForm(false);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="logo-area">
          {/* Logo como texto em vez de imagem */}
          <h1 className="logo-text">
            <span className="logo-x4">X4</span>
            <span className="logo-growth">GROWTH</span>
          </h1>
        </div>
        <div className="user-controls">
          <span>Olá, {user.username}</span>
          <button onClick={onLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="admin-content">
        <h1>Painel de Administração</h1>
        
        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : (
          <div className="admin-grid">
            <div className="clients-section">
              <div className="section-header">
                <h2>Clientes</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowClientForm(!showClientForm)}
                >
                  {showClientForm ? 'Cancelar' : '+ Adicionar Cliente'}
                </button>
              </div>
              
              {showClientForm && (
                <form className="admin-form" onSubmit={handleAddClient}>
                  <div className="form-group">
                    <label>Nome do Cliente</label>
                    <input 
                      type="text" 
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nome de Usuário</label>
                    <input 
                      type="text" 
                      value={newClient.username}
                      onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Senha</label>
                    <input 
                      type="password" 
                      value={newClient.password}
                      onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">Adicionar</button>
                </form>
              )}
              
              <div className="list-container">
                {clients.length > 0 ? (
                  <ul className="clients-list">
                    {clients.map(client => (
                      <li 
                        key={client.id} 
                        className={client.id === selectedClient ? 'selected' : ''}
                        onClick={() => setSelectedClient(client.id)}
                      >
                        {client.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-message">Nenhum cliente cadastrado.</p>
                )}
              </div>
            </div>
            
            <div className="accounts-section">
              <div className="section-header">
                <h2>Contas de Anúncio</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAccountForm(!showAccountForm)}
                  disabled={!selectedClient}
                >
                  {showAccountForm ? 'Cancelar' : '+ Adicionar Conta'}
                </button>
              </div>
              
              {showAccountForm && (
                <form className="admin-form" onSubmit={handleAddAccount}>
                  <div className="form-group">
                    <label>Nome da Conta</label>
                    <input 
                      type="text" 
                      value={newAdAccount.name}
                      onChange={(e) => setNewAdAccount({...newAdAccount, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ID da Conta (Facebook)</label>
                    <input 
                      type="text" 
                      value={newAdAccount.accountId}
                      onChange={(e) => setNewAdAccount({...newAdAccount, accountId: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">Adicionar</button>
                </form>
              )}
              
              <div className="list-container">
                {selectedClient ? (
                  <>
                    <h3>
                      {clients.find(client => client.id === selectedClient)?.name || 'Cliente Selecionado'}
                    </h3>
                    
                    {getClientAccounts().length > 0 ? (
                      <ul className="accounts-list">
                        {getClientAccounts().map(account => (
                          <li key={account.id}>
                            <strong>{account.name}</strong>
                            <span className="account-id">ID: {account.accountId}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-message">Nenhuma conta de anúncio cadastrada para este cliente.</p>
                    )}
                  </>
                ) : (
                  <p className="empty-message">Selecione um cliente para ver suas contas.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
