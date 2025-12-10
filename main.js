// ====== LOCALSTORAGE INITIALIZATION ======
let budgetData = JSON.parse(localStorage.getItem("budgetAppData")) || { totalBudget: 0 };
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ====== DOM ELEMENTS ======
const dateEl = document.getElementById("date");
const amo = document.getElementById("amo");
const rem = document.getElementById("rem");
const spentDash = document.getElementById("spentDash");
const todaySpentEl = document.getElementById("todaySpent");
const monthSpentEl = document.getElementById("monthSpent");
const progressBar = document.getElementById("progressBar");

const amountInput = document.getElementById("amount");
const amountBtn = document.getElementById("amountbtn");
const resetBudgetBtn = document.getElementById("resetBudgetBtn");

const expNameInput = document.getElementById("expName");
const expAmountInput = document.getElementById("expAmount");
const expCategorySelect = document.getElementById("expCategory");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const recentExpensesContainer = document.querySelector(".recent-expenses");

// ====== DATE DISPLAY ======
const now = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

// ====== UTILITY FUNCTIONS ======
function saveBudget() { localStorage.setItem("budgetAppData", JSON.stringify(budgetData)); }
function saveExpenses() { localStorage.setItem("expenses", JSON.stringify(expenses)); }

function formatCurrency(amount) { return `₦${Number(amount).toLocaleString()}`; }
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = months[d.getMonth()].slice(0,3);
  const hours = d.getHours().toString().padStart(2,'0');
  const minutes = d.getMinutes().toString().padStart(2,'0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

// ====== CALCULATE TOTALS ======
function calculateTotals() {
  const today = new Date();
  let todayTotal = 0;
  let monthTotal = 0;
  let totalSpent = 0;

  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    const amount = Number(exp.amount);
    totalSpent += amount;

    if (expDate.getDate() === today.getDate() &&
        expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()) {
      todayTotal += amount;
    }

    if (expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()) {
      monthTotal += amount;
    }
  });

  return { totalSpent, todayTotal, monthTotal };
}

// ====== UPDATE DASHBOARD ======
function updateDashboard() {
  const totals = calculateTotals();
  const remaining = budgetData.totalBudget - totals.totalSpent;

  // Update main values
  amo.textContent = formatCurrency(budgetData.totalBudget);   // total allowance added
  spentDash.textContent = formatCurrency(totals.totalSpent);  // total spent
  rem.textContent = formatCurrency(Math.max(remaining, 0));   // remaining

  // Update progress bar
  let percent = 0;
  if (budgetData.totalBudget > 0) {
    percent = Math.min((totals.totalSpent / budgetData.totalBudget) * 100, 100);
  }
  progressBar.style.width = `${percent}%`;

  // Update footer
  todaySpentEl.textContent = formatCurrency(totals.todayTotal);
  monthSpentEl.textContent = formatCurrency(totals.monthTotal);
}

// ====== RENDER EXPENSES ======
function renderExpenses() {
  recentExpensesContainer.innerHTML = "";
  expenses.forEach((exp, index) => {
    const div = document.createElement("div");
    div.className = "glassmorphism flex items-center justify-between gap-4 rounded-xl p-3";
    div.innerHTML = `
      <div class="flex-grow ml-[10px]">
        <p class="font-bold text-white">${exp.name}</p>
        <p class="text-sm text-gray-400">${formatDate(exp.date)}</p>
      </div>
      <p class="text-base font-bold text-white">- ${formatCurrency(exp.amount)}</p>
      <button data-index="${index}" class="deleteBtn bg-red-600 px-3 py-1 rounded-lg text-white">Delete</button>
    `;
    recentExpensesContainer.appendChild(div);
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      expenses.splice(i, 1);
      saveExpenses();
      renderExpenses();
      updateDashboard();
    });
  });
}

// ====== ADD ALLOWANCE ======
amountBtn.addEventListener("click", () => {
  const value = Number(amountInput.value.trim());
  if (!value || value <= 0) return alert("Enter valid amount > 0");

  budgetData.totalBudget += value;
  saveBudget();
  updateDashboard();
  amountInput.value = "";
});

// ====== RESET BUDGET ======
resetBudgetBtn.addEventListener("click", () => {
  if (!confirm("Reset budget? This will clear total and spent amount.")) return;

  budgetData.totalBudget = 0;
  expenses = [];
  saveBudget();
  saveExpenses();
  renderExpenses();
  updateDashboard();
});

// ====== ADD EXPENSE ======
addExpenseBtn.addEventListener("click", () => {
  const name = expNameInput.value.trim();
  const amount = Number(expAmountInput.value.trim());
  const category = expCategorySelect.value;

  if (!name || !amount || amount <= 0) return alert("Enter valid name and amount");

  expenses.push({ name, amount, category, date: new Date().toISOString() });
  saveExpenses();
  renderExpenses();
  updateDashboard();

  expNameInput.value = "";
  expAmountInput.value = "";
});

// ====== INITIAL RENDER ======
renderExpenses();
updateDashboard();