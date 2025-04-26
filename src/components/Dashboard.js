// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Dashboard.css';
import X4Logo from '../assets/x4-logo.png';
import { fetchAdAccounts, fetchCampaignData } from '../services/facebookApi';

const Dashboard = ({ user, onLogout }) => {
  // Estado para armazenar as contas de anúncio
  const [adAccounts, setAdAccounts] = useState([]);
  // Estado para a conta de anúncio selecionada
  const [selectedAccount, setSelectedAccount] = useState('');
  // Estado para armazenar os dados das campanhas
  const [campaignData, setCampaignData] = useState([]);
  // Estado para armazenar as métricas agrupadas por nome de campanha
  const [groupedMetrics, setGroupedMetrics] = useState([]);
  // Estado para seleção de datas
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  // Estado para visualizar todas as campanhas ou uma específica
  const [viewAllCampaigns, setViewAllCampaigns] = useState(true);
  // Estado para a campanha selecionada
  const [selectedCampaign, setSelectedCampaign] = useState('');
  // Estado para mostrar loading
  const [loading, setLoading] = useState(false);

  // Buscar contas de anúncio ao carregar o componente
  useEffect(() => {
    const getAdAccounts = async () => {
      try {
        setLoading(true);
        const accounts = await fetchAdAccounts();
        setAdAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0].id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar contas de anúncio:', error);
        setLoading(false);
      }
    };

    getAdAccounts();
  }, []);

  // Buscar dados das campanhas quando a conta de anúncio ou período for alterado
  useEffect(() => {
    const getCampaignData = async () => {
      if (!selectedAccount) return;

      try {
        setLoading(true);
        const data = await fetchCampaignData(
          selectedAccount,
          formatDate(startDate),
          formatDate(endDate)
        );
        setCampaignData(data);
        
        // Agrupar métricas por nome de campanha
        const grouped = groupMetricsByName(data);
        setGroupedMetrics(grouped);
        
        // Se existirem campanhas, selecione a primeira por padrão
        if (grouped.length > 0) {
          setSelectedCampaign(grouped[0].name);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados das campanhas:', error);
        setLoading(false);
      }
    };

    getCampaignData();
  }, [selectedAccount, startDate, endDate]);

  // Função para formatar data para o formato YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Função para agrupar métricas por nome de campanha
  const groupMetricsByName = (data) => {
    const grouped = {};

    data.forEach(campaign => {
      // Extrair o nome da campanha (ex: "ELLEN", "DAIANE", etc)
      // Assumindo que o nome está no início do título seguido por espaço ou traço
      const nameMatch = campaign.name.match(/^([A-Za-z]+)/);
      if (nameMatch) {
        const name = nameMatch[0].toUpperCase();
        
        if (!grouped[name]) {
          grouped[name] = {
            name,
            spend: 0,
            messages: 0,
            reach: 0,
            cpm: 0,
            uniqueClicks: 0,
            ctr: 0,
            campaigns: []
          };
        }
        
        // Adicionar métricas ao grupo
        grouped[name].spend += parseFloat(campaign.spend || 0);
        grouped[name].messages += parseInt(campaign.messages || 0);
        grouped[name].reach += parseInt(campaign.reach || 0);
        grouped[name].uniqueClicks += parseInt(campaign.unique_clicks || 0);
        grouped[name].campaigns.push(campaign);
      }
    });

    // Calcular métricas derivadas
    Object.keys(grouped).forEach(name => {
      const group = grouped[name];
      // CPM = (spend / reach) * 1000
      group.cpm = group.reach > 0 ? (group.spend / group.reach) * 1000 : 0;
      // CTR = (uniqueClicks / reach) * 100
      group.ctr = group.reach > 0 ? (group.uniqueClicks / group.reach) * 100 : 0;
    });

    return Object.values(grouped);
  };

  // Calcular métricas totais
  const calculateTotals = () => {
    const totals = {
      spend: 0,
      messages: 0,
      reach: 0,
      uniqueClicks: 0
    };

    groupedMetrics.forEach(group => {
      totals.spend += group.spend;
      totals.messages += group.messages;
      totals.reach += group.reach;
      totals.uniqueClicks += group.uniqueClicks;
    });

    // Calcular métricas derivadas
    totals.cpm = totals.reach > 0 ? (totals.spend / totals.reach) * 1000 : 0;
    totals.ctr = totals.reach > 0 ? (totals.uniqueClicks / totals.reach) * 100 : 0;

    return totals;
  };

  // Obter dados da campanha selecionada ou totais
  const getDisplayData = () => {
    if (viewAllCampaigns) {
      return calculateTotals();
    } else {
      const selected = groupedMetrics.find(group => group.name === selectedCampaign);
      return selected || calculateTotals();
    }
  };

  const displayData = getDisplayData();

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar percentual
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Dados para o gráfico de alcance por campanha
  const reachChartData = groupedMetrics.map(group => ({
    name: group.name,
    alcance: group.reach
  }));

  // Dados para o gráfico de mensagens por campanha
  const messagesChartData = groupedMetrics.map(group => ({
    name: group.name,
    mensagens: group.messages
  }));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
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

      <div className="dashboard-content">
        <div className="filter-section">
          <div className="filter-group">
            <label>Conta de Anúncio:</label>
            <select 
              value={selectedAccount} 
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="select-control"
            >
              {adAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Período:</label>
            <div className="date-range">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="date-picker"
                dateFormat="dd/MM/yyyy"
              />
              <span>até</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="date-picker"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Visualização:</label>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewAllCampaigns ? 'active' : ''}`}
                onClick={() => setViewAllCampaigns(true)}
              >
                Todas Campanhas
              </button>
              <button 
                className={`toggle-btn ${!viewAllCampaigns ? 'active' : ''}`}
                onClick={() => setViewAllCampaigns(false)}
              >
                Por Campanha
              </button>
            </div>
          </div>

          {!viewAllCampaigns && (
            <div className="filter-group">
              <label>Campanha:</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="select-control"
              >
                {groupedMetrics.map(group => (
                  <option key={group.name} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : (
          <>
            <div className="metrics-section">
              <div className="metric-card">
                <h3>Valor Investido</h3>
                <p className="metric-value">{formatCurrency(displayData.spend)}</p>
              </div>
              <div className="metric-card">
                <h3>Mensagens Iniciadas</h3>
                <p className="metric-value">{displayData.messages}</p>
              </div>
              <div className="metric-card">
                <h3>Alcance Total</h3>
                <p className="metric-value">{displayData.reach}</p>
              </div>
              <div className="metric-card">
                <h3>CPM</h3>
                <p className="metric-value">{formatCurrency(displayData.cpm)}</p>
              </div>
              <div className="metric-card">
                <h3>Cliques Únicos</h3>
                <p className="metric-value">{displayData.uniqueClicks}</p>
              </div>
              <div className="metric-card">
                <h3>CTR Único</h3>
                <p className="metric-value">{formatPercent(displayData.ctr)}</p>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h3>Alcance por Campanha</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reachChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} 
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="alcance" fill="#4287f5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Mensagens por Campanha</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={messagesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} 
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="mensagens" stroke="#00a8ff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
