// =====================================================
// VARIABLES
// =====================================================
let loans = [];
let clients = [];
let paiements = [];
let filteredPaiements = [];

let currentPage = 1;
const paymentsPerPage = 10; // nombre de paiements par page

const paginationContainer = document.getElementById("pagination");


// =====================================================
// SELECTEURS FORM
// =====================================================
const formPaiement = document.getElementById("paiement-form");
const paymentIdInput = document.getElementById("payment-id");

const montantInput = document.getElementById("montant");
const dateInput = document.getElementById("date");
const modeInput = document.getElementById("mode");
const noteInput = document.getElementById("note");
const loanSelect = document.getElementById("pretSelect");

const submitBtn = document.getElementById("submit-btn");
const cancelEdit = document.getElementById("cancel-edit");

const paymentsTableBody = document.querySelector("#payments-table tbody");

cancelEdit.style.display = "none";


// =====================================================
// 1. Charger les clients
// =====================================================
async function loadClients() {
    try {
        const res = await fetch("/allClients");
        clients = await res.json();
    } catch (err) {
        console.error(err);
        showError("Erreur chargement clients");
    }
}


// =====================================================
// 2. Charger les prêts + remplir le SELECT
// =====================================================
async function loadLoans() {
    try {
        const res = await fetch("/allLoans");
        loans = await res.json();

        loanSelect.innerHTML = `
            <option value="">Sélectionnez un prêt</option>
            ${loans.map(l => {
                const c = clients.find(x => x.id === l.client_id);
                const nom = c ? `${c.prenom} ${c.nom}` : "Client inconnu";
                return `<option value="${l.id}">${nom} - ${l.montant}$ (Solde: ${l.solde}$)</option>`;
            }).join("")}
        `;
    } catch (err) {
        console.error(err);
        showError("Erreur chargement prêts");
    }
}


// =====================================================
// 3. Charger les paiements
// =====================================================
async function loadPayments() {
    const loanId = loanSelect.value;
    let res;

    try {
        if (loanId) {
            res = await fetch(`/paiements/${loanId}`);
        } else {
            res = await fetch(`/allPaiements`);
        }

        paiements = await res.json();
        filteredPaiements = paiements;

        currentPage = 1;
        paginatePayments();

    } catch (err) {
        console.error(err);
        showError("Erreur chargement paiements");
    }
}


// =====================================================
// 4. Affichage tableau + pagination
// =====================================================
function renderPayments(list = paiements) {
    paymentsTableBody.innerHTML = "";

    if (list.length === 0) {
        paymentsTableBody.innerHTML =
            `<tr><td colspan="6" class="has-text-centered">Aucun paiement trouvé</td></tr>`;
        return;
    }

    list.forEach(p => {
        const loan = loans.find(l => l.id == p.loan_id);
        const client = loan ? clients.find(c => c.id == loan.client_id) : null;

        const name = client ? `${client.prenom} ${client.nom}` : "Client inconnu";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${name}</td>
            <td>${p.montant}$</td>
            <td>${p.date}</td>
            <td>${p.mode}</td>
            <td>${p.note || "—"}</td>
            <td class="is-flex" style="gap:6px;">
                <button class="button is-small is-primary" data-edit="${p.id}">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="button is-small is-danger" data-del="${p.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        paymentsTableBody.appendChild(row);
    });
}


// =============================
// PAGINATION
// =============================
function paginatePayments() {
    const start = (currentPage - 1) * paymentsPerPage;
    const end = start + paymentsPerPage;

    const pageList = filteredPaiements.slice(start, end);

    renderPayments(pageList);
    renderPaymentsPagination();
}

function renderPaymentsPagination() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(filteredPaiements.length / paymentsPerPage);
    if (totalPages <= 1) return;

    // bouton précédent
    const prevBtn = document.createElement("button");
    prevBtn.className = "button is-small";
    prevBtn.textContent = "« Précédent";
    prevBtn.disabled = currentPage === 1;

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            paginatePayments();
        }
    });

    paginationContainer.appendChild(prevBtn);

    // boutons numérotés
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");

        pageBtn.className =
            "button is-small" + (i === currentPage ? " is-primary" : "");

        pageBtn.textContent = i;

        pageBtn.addEventListener("click", () => {
            currentPage = i;
            paginatePayments();
        });

        paginationContainer.appendChild(pageBtn);
    }

    // bouton suivant
    const nextBtn = document.createElement("button");
    nextBtn.className = "button is-small";
    nextBtn.textContent = "Suivant »";
    nextBtn.disabled = currentPage === totalPages;

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            paginatePayments();
        }
    });

    paginationContainer.appendChild(nextBtn);
}


// =====================================================
// 5. Ajout / Modification paiement
// =====================================================
formPaiement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = paymentIdInput.value;
    const loan_id = loanSelect.value;
    const montant = montantInput.value;
    const date = dateInput.value;
    const mode = modeInput.value;
    const note = noteInput.value;

    if (!loan_id) return showError("Veuillez sélectionner un prêt");
    if (montant <= 0) return showError("Montant invalide");

    try {
        let res;

        if (id) {
            res = await fetch(`/editPaiement/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loan_id, montant, date, mode, note })
            });
        } else {
            res = await fetch("/addPaiement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loan_id, montant, date, mode, note })
            });
        }

        if (!res.ok) return showError("Erreur sauvegarde paiement");

        showSuccess(id ? "Paiement modifié" : "Paiement ajouté");

        formPaiement.reset();
        paymentIdInput.value = "";
        cancelEdit.style.display = "none";
        submitBtn.textContent = "Ajouter le paiement";

        const selectedLoan = loan_id;
        await loadLoans();
        loanSelect.value = selectedLoan;
        await loadPayments();

    } catch (err) {
        console.error(err);
        showError("Erreur lors de la soumission");
    }
});


// =====================================================
// 6. Boutons édition & suppression
// =====================================================
paymentsTableBody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");

    // ÉDITION
    if (editBtn) {
        const id = editBtn.dataset.edit;
        const p = paiements.find(x => x.id == id);

        paymentIdInput.value = id;
        loanSelect.value = p.loan_id;
        montantInput.value = p.montant;
        dateInput.value = p.date;
        modeInput.value = p.mode;
        noteInput.value = p.note;

        submitBtn.textContent = "Modifier";
        cancelEdit.style.display = "inline-block";
        return;
    }

    // SUPPRESSION
    if (delBtn) {
        const id = delBtn.dataset.del;

        if (!confirm("Supprimer ce paiement ?")) return;

        try {
            const res = await fetch(`/deletePaiement/${id}`, { method: "DELETE" });
            if (!res.ok) return showError("Erreur suppression");

            showSuccess("Paiement supprimé");

            const selectedLoan = loanSelect.value;
            await loadLoans();
            loanSelect.value = selectedLoan;
            await loadPayments();

        } catch (err) {
            console.error(err);
        }
    }
});


// =====================================================
// Notifications
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


// =====================================================
// Recharger paiements quand le prêt change
// =====================================================
loanSelect.addEventListener("change", loadPayments);


// =====================================================
// INIT
// =====================================================
async function init() {
    await loadClients();
    await loadLoans();
    await loadPayments();
}

init();
