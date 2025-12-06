// =====================================================
// DASHBOARD - BES Loan Lite
// =====================================================

let loans = [];
let clients = [];
let paiements = [];

// Stats
let stats = {
    preetsActifs: 0,
    preetsRembourses: 0,
    preetsEnRetard: 0,
    montantTotalPrete: 0,
    montantTotalRembourse: 0,
    clientsEnRetard: []
};

// =====================================================
// 1. Charger toutes les données
// =====================================================
async function loadAllData() {
    const tbody = document.getElementById('dashboard-tbody');
    
    if (!tbody) {
        console.error('Element dashboard-tbody introuvable!');
        return;
    }

    // Message de chargement
    tbody.innerHTML = '<tr><td colspan="6" class="has-text-centered">Chargement des données...</td></tr>';

    try {
        console.log('Chargement des données...');
        
        // Charger en parallèle
        const [resClients, resLoans, resPaiements] = await Promise.all([
            fetch('/allClients'),
            fetch('/allLoans'),
            fetch('/allPaiements')
        ]);

        if (!resClients.ok || !resLoans.ok || !resPaiements.ok) {
            throw new Error('Erreur de réponse du serveur');
        }

        clients = await resClients.json();
        loans = await resLoans.json();
        paiements = await resPaiements.json();

        console.log('Données chargées:', { clients: clients.length, loans: loans.length, paiements: paiements.length });

        calculateStats();
        renderDashboard();

    } catch (err) {
        console.error('Erreur chargement Dashboard:', err);
        tbody.innerHTML = '<tr><td colspan="6" class="has-text-centered has-text-danger">⚠️ Erreur: Impossible de charger les données. Vérifiez que le serveur est démarré.</td></tr>';
        showError('Impossible de charger le Dashboard');
    }
}

// =====================================================
// 2. Calculer les statistiques
// =====================================================
function calculateStats() {
    stats.preetsActifs = 0;
    stats.preetsRembourses = 0;
    stats.preetsEnRetard = 0;
    stats.montantTotalPrete = 0;
    stats.montantTotalRembourse = 0;
    stats.clientsEnRetard = [];

    const today = new Date();

    loans.forEach(loan => {
        // Montant total prêté
        stats.montantTotalPrete += Number(loan.montant) || 0;

        // Compter par statut
        if (loan.statut === 'ACTIF') {
            stats.preetsActifs++;
        } else if (loan.statut === 'REMBOURSÉ') {
            stats.preetsRembourses++;
        } else if (loan.statut === 'EN RETARD') {
            stats.preetsEnRetard++;

            // Calculer jours de retard (simple estimation)
            const startDate = new Date(loan.date);
            const monthsElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30));
            const expectedPayments = monthsElapsed * (Number(loan.montant) / Number(loan.duree));
            const actualPayments = Number(loan.montant) - Number(loan.solde);
            
            if (actualPayments < expectedPayments) {
                const client = clients.find(c => c.id === loan.client_id);
                const joursRetard = Math.floor((expectedPayments - actualPayments) / (Number(loan.montant) / Number(loan.duree)) * 30);
                
                stats.clientsEnRetard.push({
                    nom: client ? `${client.prenom} ${client.nom}` : 'Inconnu',
                    joursRetard: joursRetard > 0 ? joursRetard : 1
                });
            }
        }
    });

    // Calculer montant remboursé (montant - solde pour tous les prêts)
    loans.forEach(loan => {
        const rembourse = Number(loan.montant) - Number(loan.solde);
        stats.montantTotalRembourse += rembourse;
    });
}

// =====================================================
// 3. Afficher le Dashboard
// =====================================================
function renderDashboard() {
    const tbody = document.getElementById('dashboard-tbody');
    
    if (!tbody) {
        console.error('tbody dashboard-tbody introuvable!');
        return;
    }

    console.log('Affichage des stats:', stats);

    // Clients en retard (liste)
    let clientsRetardText = stats.clientsEnRetard.length > 0
        ? stats.clientsEnRetard.map(c => `${c.nom} (${c.joursRetard} jours)`).join(', ')
        : 'Aucun';

    tbody.innerHTML = `
        <tr>
            <td><strong>${stats.preetsActifs}</strong></td>
            <td><strong>${stats.preetsRembourses}</strong></td>
            <td><strong class="${stats.preetsEnRetard > 0 ? 'has-text-danger' : ''}">${stats.preetsEnRetard}</strong></td>
            <td><strong>${stats.montantTotalPrete.toFixed(2)} $</strong></td>
            <td><strong>${stats.montantTotalRembourse.toFixed(2)} $</strong></td>
            <td>${clientsRetardText}</td>
        </tr>
    `;

    // Pastille rouge dans le menu (si retards)
    updateRetardBadge();
}

// =====================================================
// 4. Pastille rouge dans le menu
// =====================================================
function updateRetardBadge() {
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (!navbarMenu) return;

    // Supprimer ancienne pastille
    const oldBadge = document.querySelector('.retard-badge');
    if (oldBadge) oldBadge.remove();

    // Ajouter nouvelle pastille si retards
    if (stats.preetsEnRetard > 0) {
        const dashboardLink = navbarMenu.querySelector('a[href="index.html"]');
        
        if (dashboardLink) {
            const badge = document.createElement('span');
            badge.className = 'tag is-danger is-rounded retard-badge';
            badge.textContent = stats.preetsEnRetard;
            badge.style.marginLeft = '8px';
            badge.style.fontSize = '0.75rem';
            
            dashboardLink.appendChild(badge);
        }
    }
}

// =====================================================
// 5. Bouton Rafraîchir
// =====================================================
function addRefreshButton() {
    const container = document.querySelector('.dashboard-table').parentElement;
    
    if (!container) return;

    // Vérifier si bouton existe déjà
    if (document.getElementById('refresh-dashboard')) return;

    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-dashboard';
    refreshBtn.className = 'button is-info is-small';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Mettre à jour';
    refreshBtn.style.marginTop = '1rem';
    
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('is-loading');
        await loadAllData();
        refreshBtn.classList.remove('is-loading');
        showSuccess('Dashboard mis à jour');
    });

    container.appendChild(refreshBtn);
}

// =====================================================
// Notifications
// =====================================================
function showSuccess(msg) {
    const notification = document.createElement('div');
    notification.className = 'notification is-success is-light';
    notification.textContent = msg;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

function showError(msg) {
    const notification = document.createElement('div');
    notification.className = 'notification is-danger is-light';
    notification.textContent = msg;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

// =====================================================
// INIT
// =====================================================
async function init() {
    await loadAllData();
    addRefreshButton();
}

// Lancer au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
