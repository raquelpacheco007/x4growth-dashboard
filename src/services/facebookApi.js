// src/services/facebookApi.js

// Token de acesso da API do Facebook
const ACCESS_TOKEN = 'EAAJaMYfkzOoBO0WxpmfnldCndzWhYoyrWpC0OIdloL9b4Nzz15gIVh3pzhoQRmjwxaV93DeGtSZBnctw7heeJZBPza6IjwpQ92ZCAj8MBUhCMmemXQuZA5ZBir4kDBGp2wOW8CUYbxarjVs1My2jJBT7QR3fwbAa4VBZAFHAMQqnySSjkuIWZAEPZAzasI8O';

// Lista de contas de anúncio hardcoded para demonstração
const DEMO_AD_ACCOUNTS = [
  { 
    id: 'act_1163342075039039', 
    name: 'POPDENTS - FORTALEZA',
    clientId: 'client_popdents'
  },
  { 
    id: 'act_1855895228554990', 
    name: 'POPDENTS - INTERIOR CEARÁ',
    clientId: 'client_popdents'
  },
  { 
    id: 'act_1746453236304218', 
    name: 'POPDENTS - BELÉM',
    clientId: 'client_popdents'
  },
  { 
    id: 'act_613787471423916', 
    name: 'POPDENTS - INTERIOR PARÁ',
    clientId: 'client_popdents'
  },
  { 
    id: 'act_1167056531494491', 
    name: 'POPDENTS - ESTADOS',
    clientId: 'client_popdents'
  }
];

// Lista de clientes hardcoded para demonstração
const DEMO_CLIENTS = [
  {
    id: 'client_popdents',
    name: 'POPDENTS',
    username: 'POPDENTS',
    password: 'POP@2025',
    isAdmin: false
  }
];

// Função para buscar contas de anúncio
// Em um ambiente de produção, isso faria uma chamada real à API do Facebook
export const fetchAdAccounts = async () => {
  // Simulando uma chamada de API com um pequeno atraso
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(DEMO_AD_ACCOUNTS);
    }, 500);
  });
};

// Função para buscar clientes
export const fetchClients = async () => {
  // Simulando uma chamada de API com um pequeno atraso
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(DEMO_CLIENTS);
    }, 500);
  });
};

// Função para adicionar um novo cliente
export const addClient = async (client) => {
  // Simulando uma chamada de API com um pequeno atraso
  return new Promise(resolve => {
    setTimeout(() => {
      const newClient = {
        id: `client_${Date.now()}`,
        ...client,
        isAdmin: false
      };
      
      // Em um ambiente real, isso enviaria os dados para um backend
      DEMO_CLIENTS.push(newClient);
      
      resolve(newClient);
    }, 500);
  });
};

// Função para adicionar uma nova conta de anúncio
export const addAdAccount = async (account) => {
  // Simulando uma chamada de API com um pequeno atraso
  return new Promise(resolve => {
    setTimeout(() => {
      const newAccount = {
        id: account.accountId,
        name: account.name,
        clientId: account.clientId
      };
      
      // Em um ambiente real, isso enviaria os dados para um backend
      DEMO_AD_ACCOUNTS.push(newAccount);
      
      resolve(newAccount);
    }, 500);
  });
};

// Dados de campanha de exemplo para simulação
const generateDemoCampaignData = (accountId, startDate, endDate) => {
  // Nomes de campanha de exemplo
  const campaignNames = ['ELLEN', 'DAIANE', 'BRUNA', 'REBECA', 'ALEX', 'CAIO'];
  const campaigns = [];
  
  // Gera dados aleatórios para cada nome
  campaignNames.forEach(name => {
    // Gera entre 1 e 3 campanhas por nome
    const numCampaigns = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numCampaigns; i++) {
      campaigns.push({
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${name} - Campanha ${i + 1}`,
        spend: (Math.random() * 1000 + 100).toFixed(2),
        messages: Math.floor(Math.random() * 500 + 50),
        reach: Math.floor(Math.random() * 10000 + 1000),
        unique_clicks: Math.floor(Math.random() * 300 + 30),
        start_date: startDate,
        end_date: endDate,
        account_id: accountId
      });
    }
  });
  
  return campaigns;
};

// Função para buscar dados de campanhas para uma conta específica
export const fetchCampaignData = async (accountId, startDate, endDate) => {
  // Em um ambiente real, isso faria uma chamada à API do Facebook
  // usando o endpoint de Insights para obter métricas de campanha
  
  // Simulando uma chamada de API com um pequeno atraso
  return new Promise(resolve => {
    setTimeout(() => {
      const campaignData = generateDemoCampaignData(accountId, startDate, endDate);
      resolve(campaignData);
    }, 800);
  });
};

// Função real para buscar dados da API do Facebook (em um ambiente de produção)
// Esta função seria usada em vez das simulações acima
export const fetchRealCampaignData = async (accountId, startDate, endDate) => {
  try {
    const fields = 'campaign_name,spend,reach,impressions,unique_clicks,actions';
    const url = `https://graph.facebook.com/v17.0/${accountId}/insights?fields=${fields}&time_range={'since':'${startDate}','until':'${endDate}'}&level=campaign&access_token=${ACCESS_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    // Transformar os dados para o formato esperado pelo frontend
    return data.data.map(campaign => ({
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      spend: campaign.spend,
      reach: campaign.reach,
      unique_clicks: campaign.unique_clicks,
      messages: campaign.actions?.find(action => action.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0,
      // Outras métricas conforme necessário
    }));
  } catch (error) {
    console.error('Erro ao buscar dados da API do Facebook:', error);
    throw error;
  }
};