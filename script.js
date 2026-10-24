// Substitua pela URL do seu Apps Script publicado
const API_URL = 'https://script.google.com/macros/s/AKfycbxKkOijagfgYkvEcNQs-aUNVXoAwucZrZc4DcnEo9e6GOx9rIVZFHNptSjH5EsKOmYq/exec';

// Elementos do DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Verificar se o usuário já está logado (simples localStorage)
if (localStorage.getItem('usuarioLogado')) {
    showDashboard(localStorage.getItem('usuarioLogado'));
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    try {
        // Tenta login
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', usuario, senha })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('usuarioLogado', usuario);
            showDashboard(usuario);
        } else {
            // Se falhar, tenta primeiro acesso (cadastro)
            const cadastroResponse = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'primeiroAcesso', usuario, senha })
            });
            const cadastroData = await cadastroResponse.json();
            
            if (cadastroData.success) {
                alert('Senha definida com sucesso! Faça login novamente.');
                loginError.textContent = 'Senha definida. Tente entrar novamente.';
            } else {
                loginError.textContent = data.message || 'Erro ao fazer login.';
            }
        }
    } catch (error) {
        loginError.textContent = 'Erro de conexão com o servidor.';
    }
});

// Mostrar Dashboard
function showDashboard(usuario) {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    document.getElementById('username-welcome').textContent = usuario;
    document.getElementById('user-display').textContent = usuario;
    
    // Carregar dados da planilha
    carregarPedidos(usuario);
}

// Carregar Pedidos da Planilha
async function carregarPedidos(usuario) {
    const response = await fetch(`${API_URL}?action=getPedidos`);
    const data = await response.json();
    
    // Filtrar apenas os pedidos do usuário logado (Coluna A da planilha é o @)
    const pedidos = data.filter(row => row[0] === usuario);
    
    const container = document.getElementById('pedidos-list');
    container.innerHTML = ''; // Limpa
    
    pedidos.forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'pedido-card';
        // Ajuste os índices conforme sua planilha: 0=@, 1=Grupo, 2=Item, 3=Status
        card.innerHTML = `
            <h4>${pedido[1] || 'Grupo'}</h4>
            <p><strong>Item:</strong> ${pedido[2] || 'Item'}</p>
            <p><strong>Status:</strong> ${pedido[3] || 'Pendente'}</p>
        `;
        container.appendChild(card);
    });

    // Atualizar Estatísticas (exemplo simples)
    document.getElementById('stat-cegs').textContent = pedidos.length;
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    location.reload();
});
