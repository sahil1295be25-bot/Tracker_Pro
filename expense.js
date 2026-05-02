document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    const dateInput = document.getElementById('date');
    const descInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const expenseList = document.getElementById('expense-list');
    
    const totalBalanceEl = document.getElementById('total-balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');

    // Set today's date as default
    dateInput.valueAsDate = new Date();

    let transactions = JSON.parse(localStorage.getItem('expenseRecords')) || [];

    function updateStats() {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === 'Income') {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });

        const balance = income - expense;

        totalIncomeEl.textContent = `$${income.toFixed(2)}`;
        totalExpenseEl.textContent = `$${expense.toFixed(2)}`;
        totalBalanceEl.textContent = `$${balance.toFixed(2)}`;

        if (balance < 0) {
            totalBalanceEl.style.color = 'var(--danger)';
        } else if (balance > 0) {
            totalBalanceEl.style.color = 'var(--success)';
        } else {
            totalBalanceEl.style.color = 'inherit';
        }
    }

    function renderRecords() {
        expenseList.innerHTML = '';

        if (transactions.length === 0) {
            expenseList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No transactions found. Add your first one!</p>';
            return;
        }

        // Sort by date descending
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedTransactions.forEach(t => {
            const recordEl = document.createElement('div');
            recordEl.classList.add('record-item');
            
            const isIncome = t.type === 'Income';
            const amountClass = isIncome ? 'expense-positive' : 'expense-negative';
            const sign = isIncome ? '+' : '-';

            recordEl.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${t.description}</div>
                    <div class="record-meta">${new Date(t.date).toLocaleDateString()} &bull; ${t.type}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div class="record-amount ${amountClass}">${sign}$${t.amount.toFixed(2)}</div>
                    <button class="btn btn-danger" onclick="deleteTransaction('${t.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            expenseList.appendChild(recordEl);
        });

        updateStats();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newTransaction = {
            id: Date.now().toString(),
            date: dateInput.value,
            description: descInput.value.trim(),
            amount: parseFloat(amountInput.value),
            type: typeInput.value
        };

        transactions.push(newTransaction);
        localStorage.setItem('expenseRecords', JSON.stringify(transactions));
        
        descInput.value = '';
        amountInput.value = '';
        renderRecords();
    });

    window.deleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('expenseRecords', JSON.stringify(transactions));
        renderRecords();
    };

    // Initial render
    renderRecords();
});
