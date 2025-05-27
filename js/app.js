// --- Sélecteurs ---
const form = document.getElementById('transaction-form');
const montantInput = document.getElementById('montant');
const categorieInput = document.getElementById('categorie');
const dateInput = document.getElementById('date');
const editIdInput = document.getElementById('edit-id');
const resetBtn = document.getElementById('reset-btn');
const formError = document.getElementById('form-error');
const soldeSpan = document.getElementById('solde');
const transactionsList = document.getElementById('transactions-list');
const totalRevenusSpan = document.getElementById('total-revenus');
const totalDepensesSpan = document.getElementById('total-depenses');
const btnProfil = document.getElementById("btn-profil");
const btnDeconnexion = document.getElementById("btn-deconnexion");

let chart;

// --- Navigation boutons ---
btnProfil.addEventListener("click", () => {
  window.location.href = "../public/profil.html"; // assure-toi que ce fichier existe
});

btnDeconnexion.addEventListener("click", () => {
  localStorage.removeItem("sessionUser");
  window.location.href = "../public/login.html";
});

// --- Données ---
function getTransactions() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}

function saveTransactions(transactions) {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// --- Affichage principal ---
function render() {
  const transactions = getTransactions();
  const now = new Date();
  const mois = now.getMonth();
  const annee = now.getFullYear();

  const moisTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === mois && d.getFullYear() === annee;
  });

  let solde = 0, totalRevenus = 0, totalDepenses = 0;
  moisTransactions.forEach(t => {
    if (t.categorie === 'revenu') {
      solde += t.montant;
      totalRevenus += t.montant;
    } else {
      solde -= t.montant;
      totalDepenses += t.montant;
    }
  });

  soldeSpan.textContent = solde.toFixed(2) + ' €';
  totalRevenusSpan.textContent = totalRevenus.toFixed(2) + ' €';
  totalDepensesSpan.textContent = totalDepenses.toFixed(2) + ' €';

  transactionsList.innerHTML = '';
  moisTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const t of moisTransactions) {
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'transaction-info';
    const cat = t.categorie === 'revenu' ? 'Revenu' : t.categorie.charAt(0).toUpperCase() + t.categorie.slice(1);
    info.innerHTML = `<span>${cat} - ${t.date}</span><span class="transaction-montant ${t.categorie === 'revenu' ? 'revenu' : 'depense'}">${t.categorie === 'revenu' ? '+' : '-'}${t.montant.toFixed(2)} €</span>`;
    li.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'transaction-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Modifier';
    editBtn.onclick = () => editTransaction(t.id);
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Supprimer';
    delBtn.onclick = () => deleteTransaction(t.id);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);

    transactionsList.appendChild(li);
  }

  renderChart(moisTransactions);
  localStorage.setItem("soldeTotal", calculerSoldeTotal());
}

function renderChart(transactions) {
  const categories = ['alimentaire', 'logement', 'transport', 'loisirs', 'autre'];
  const data = categories.map(cat => {
    return transactions.filter(t => t.categorie === cat).reduce((sum, t) => sum + t.montant, 0);
  });

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('chart'), {
    type: 'doughnut',
    data: {
      labels: ['Alimentaire', 'Logement', 'Transport', 'Loisirs', 'Autre'],
      datasets: [{
        data,
        backgroundColor: ['#6a11cb', '#2575fc', '#43e97b', '#f7971e', '#e74c3c'],
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function calculerSoldeTotal() {
  const transactions = getTransactions();
  let solde = 0;
  transactions.forEach(t => {
    if (t.categorie === 'revenu') {
      solde += t.montant;
    } else {
      solde -= t.montant;
    }
  });
  return solde;
}

// --- Formulaire ---
form.onsubmit = function(e) {
  e.preventDefault();
  const montant = parseFloat(montantInput.value);
  const categorie = categorieInput.value;
  const date = dateInput.value;
  const editId = editIdInput.value;

  if (isNaN(montant) || montant <= 0) {
    formError.textContent = 'Le montant doit être un nombre positif.';
    return;
  }
  if (!categorie) {
    formError.textContent = 'Veuillez choisir une catégorie.';
    return;
  }
  if (!date) {
    formError.textContent = 'Veuillez choisir une date.';
    return;
  }

  let transactions = getTransactions();
  if (editId) {
    transactions = transactions.map(t => t.id === editId ? { ...t, montant, categorie, date } : t);
    resetForm();
  } else {
    transactions.push({
      id: Date.now().toString(),
      montant,
      categorie,
      date
    });
  }

  saveTransactions(transactions);
  formError.textContent = '';
  form.reset();
  render();
};

function editTransaction(id) {
  const t = getTransactions().find(t => t.id === id);
  if (!t) return;
  montantInput.value = t.montant;
  categorieInput.value = t.categorie;
  dateInput.value = t.date;
  editIdInput.value = t.id;
  resetBtn.classList.remove('hidden');
}

function deleteTransaction(id) {
  let transactions = getTransactions().filter(t => t.id !== id);
  saveTransactions(transactions);
  render();
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  resetBtn.classList.add('hidden');
}

// --- Initialisation ---
render();
