// =====================================================
// VARIABLES
// =====================================================
let loans = [];
let clients = [];
let filteredLoans = [];
let currentPage = 1;
let loansPerPage = 10;


// =====================================================
// SELECTEURS FORM
// =====================================================
const formLoans = document.getElementById("loan-form");
const loanId = document.getElementById("loan-id");

const loanClientSelect = document.getElementById("clientSelect");
const montantInput = document.getElementById("montant");
const tauxInput = document.getElementById("taux");
const dureeInput = document.getElementById("duree");
const dateInput = document.getElementById("date");

const submitBtn = document.getElementById("submit-btn");
const cancelEdit = document.getElementById("cancel-edit");

const loansTableBody = document.querySelector("#loans-table tbody");
const searchInput = document.getElementById("search-loan");

cancelEdit.style.display = "none";


// =====================================================
// 1. Load Clients
// =====================================================
async function loadClients() {
    try {
        const res = await fetch("/allClients");
        clients = await res.json();

        loanClientSelect.innerHTML = `
            <option value="">Sélectionnez un client</option>
            ${clients.map(c => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join("")}
        `;

        document.getElementById("filter-client").innerHTML = `
            <option value="">Tous les clients</option>
            ${clients.map(c => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join("")}
        `;

    } catch (err) {
        console.error(err);
        showError("Impossible de charger les clients");
    }
}


// =====================================================
// 2. Load Loans
// =====================================================
async function loadLoans() {
    try {
        const res = await fetch('/allLoans');
        if (!res.ok) {
            showError('Erreur lors de la recuperation des prêts');
            return;
        }
        loans = await res.json();
        filteredLoans = [...loans];
        currentPage = 1;
        AffichageLoans();
        renderPagination();
    } catch (err) {
        console.error(err);
        showError('Erreur lors de la recuperation des prêts');
    }
}



// =====================================================
// 3. Affichage Loans
// =====================================================
function AffichageLoans() {
    loansTableBody.innerHTML = "";
    
    const start = (currentPage - 1) * loansPerPage;
    const end = start + loansPerPage;

    filteredLoans.slice(start, end).forEach(l => {
        const client = clients.find(c => String(c.id) === String(l.client_id));

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${client ? client.prenom + " " + client.nom : "—"}</td>
            <td>${l.montant}$</td>
            <td>${l.taux}%</td>
            <td>${l.duree} mois</td>
            <td>${l.date}</td>
            <td>${l.interets || 0}$</td>
            <td>${l.solde || 0}$</td>
            <td>${l.statut}</td>
            <td>
                <button class="button is-small is-primary" data-edit="${l.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="button is-small is-danger" data-del="${l.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        loansTableBody.appendChild(row);
    });
}



// =====================================================
// 4. Pagination
// =====================================================
function renderPagination() {
    const totalPages = Math.ceil(filteredLoans.length / loansPerPage);
    const pagination = document.getElementById("pagination");

    if (!pagination) return;
    pagination.innerHTML = "";
    if (totalPages === 0) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `button ${i === currentPage ? "is-link" : ""}`;
        btn.textContent = i;

        btn.onclick = () => {
            currentPage = i;
            AffichageLoans();
            renderPagination();
        };
        pagination.appendChild(btn);
    }
}


// =====================================================
// 5. Gestion du formulaire
// =====================================================

formLoans.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const id = loanId.value.trim(); // Si présent → mode modification
    const client_id = loanClientSelect.value;
    const montant = montantInput.value;
    const taux = tauxInput.value;
    const duree = dureeInput.value;
    const date = dateInput.value;

    if (!client_id) {
        showError("Veuillez sélectionner un client");
        return;
    }
    
    if (!montant || montant <= 0) {
        showError("Veuillez entrer un montant valide");
        return;
    }

    if (!taux || taux <= 0) {
        showError("Veuillez entrer un taux  valide");
        return;
    }

    if (!duree || duree <= 0) {
        showError("Veuillez entrer une durée valide");
        return;
    }

    if (!date) {
        showError("Veuillez entrer une date valide");
        return;
    }
    try {
        if (id) {
            // PUT
            const res = await fetch(`/editLoan/${encodeURIComponent(id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ client_id, montant, taux, duree, date }),
            });
            if (!res.ok) {
                showError("Erreur lors de la modification du prêt");
                return;
            }
            showSuccess("Prêt modifié !");
            formLoans.reset();
            loanId.value = "";
            cancelEdit.style.display = "none";
            submitBtn.textContent = "Créer le prêt";
            
            await loadLoans();
        } else {
            // POST
            const res = await fetch("/addLoan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ client_id, montant, taux, duree, date }),
            });
            if (!res.ok) {
                showError("Erreur lors de la création du prêt");
                return;
            }
            showSuccess(id ? "Prêt modifié" : "Prêt créé !");
            formLoans.reset();
            loanId.value = "";
            cancelEdit.style.display = "none";
            submitBtn.textContent = "Créer le prêt";
            await loadLoans();
        }
    } catch (err) {
        console.error(err);
        showError("Erreur lors de la sauvegarde du prêt");
    }
}); 

// =====================================================
// 6. Edition / Suppression
// =====================================================
loansTableBody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("button[data-edit]");
    const delBtn = e.target.closest("button[data-del]");

    // EDIT
    if (editBtn) {
        const id = editBtn.dataset.edit;
        const loan = loans.find(l => l.id == id);

        loanId.value = id;
        loanClientSelect.value = loan.client_id;
        montantInput.value = loan.montant;
        tauxInput.value = loan.taux;
        dureeInput.value = loan.duree;
        dateInput.value = loan.date;

        showSuccess("Mode édition activé");
        submitBtn.textContent = "Enregistrer";
        cancelEdit.style.display = "inline-flex";
        return;
    }

    // DELETE
    if (delBtn) {
        const id = delBtn.dataset.del;

        if (!confirm("Confirmer la suppression du prêt ?"))
            return;

        try {
            const res = await fetch(`/deleteLoan/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) {
                showError("Erreur lors de la suppression du prêt");
                return;
            }
            await loadLoans();
        } catch (err) {
            console.error(err);
            showError("Erreur lors de la suppression du prêt");
        }
    }
});



// =====================================================
// 7. Tri
// =====================================================
let sortColumn = "";
let sortDirection = "asc";

function sortLoans(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortColumn = column;
        sortDirection = "asc";
    }

    filteredLoans.sort((a, b) => {
        let valA, valB;

        if (column === "client") {
            const clientA = clients.find(c => String(c.id) === String(a.client_id));
            const clientB = clients.find(c => String(c.id) === String(b.client_id));
            valA = clientA ? `${clientA.prenom} ${clientA.nom}`.toLowerCase() : "";
            valB = clientB ? `${clientB.prenom} ${clientB.nom}`.toLowerCase() : "";
        } else if (column === "montant" || column === "taux" || column === "duree" || column === "interets" || column === "solde") {
            valA = Number(a[column]) || 0;
            valB = Number(b[column]) || 0;
        } else if (column === "date") {
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
        } else if (column === "statut") {
            valA = String(a.statut || "").toLowerCase();
            valB = String(b.statut || "").toLowerCase();
        } else {
            valA = String(a[column] || "").toLowerCase();
            valB = String(b[column] || "").toLowerCase();
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    currentPage = 1;
    AffichageLoans();
    renderPagination();
    updateSortIcons();
}

function updateSortIcons() {
    const headers = document.querySelectorAll(".sort-link");
    headers.forEach(th => {
        const col = th.dataset.column;
        const icon = th.querySelector(".sort-icon");
        if (!icon) return;

        if (col === sortColumn) {
            icon.textContent = sortDirection === "asc" ? "▲" : "▼";
        } else {
            icon.textContent = "";
        }
    });
}

// Attacher événements de tri
document.addEventListener('DOMContentLoaded', () => {
    const sortLinks = document.querySelectorAll('.sort-link');
    sortLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', () => {
            const column = link.dataset.column;
            sortLoans(column);
        });
    });
});

// =====================================================
// 8. Recherche + Filtres
// =====================================================
document.getElementById("filter-status").addEventListener("change", applyFilters);
document.getElementById("filter-client").addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

function applyFilters() {
    const status = document.getElementById("filter-status").value;
    const clientFilter = document.getElementById("filter-client").value;
    const q = searchInput.value.toLowerCase();

    filteredLoans = loans.filter(l => {
        const client = clients.find(c => String(c.id) === String(l.client_id));
        const name = client ? `${client.prenom} ${client.nom}`.toLowerCase() : "";

        return (!status || l.statut === status)
            && (!clientFilter || String(l.client_id) === String(clientFilter))
            && (name.includes(q) || String(l.id).includes(q));
    });

    currentPage = 1;
    AffichageLoans();
    renderPagination();
}



// =====================================================
// 9. Annuler édition
// =====================================================
cancelEdit.addEventListener("click", () => {
    formLoans.reset();
    loanId.value = "";
    submitBtn.textContent = "Créer le prêt";
    cancelEdit.style.display = "none";
});



// =====================================================
// 10. Notifications
// =====================================================
function showSuccess(msg) {
    const box = document.getElementById("success-message");
    box.textContent = msg;
    box.style.display = "block";
    setTimeout(() => box.style.display = "none", 2500);
}

function showError(msg) {
    const box = document.getElementById("error-message");
    box.textContent = msg;
    box.style.display = "block";
    setTimeout(() => box.style.display = "none", 2500);
}


// Ensure clients are loaded before loans so names are available
async function init() {
    await loadClients();
    await loadLoans();
}

init();