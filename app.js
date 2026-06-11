const API_URL = 'http://localhost:3000/expenses';
const expenseList = document.getElementById('expenseList');
const expenseForm = document.getElementById('expenseForm');
const filterCategory = document.getElementById('filterCategory');

// UI States
const toggleState = (id, show) => {
    const el = document.getElementById(id);
    show ? el.classList.remove('d-none') : el.classList.add('d-none');
};

// Fetch & Display (GET)
async function fetchExpenses(categoryFilter = 'All') {
    toggleState('loadingState', true);
    toggleState('errorState', false);
    expenseList.innerHTML = '';

    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        const filteredData = categoryFilter === 'All' 
            ? data 
            : data.filter(item => item.category === categoryFilter);

        renderList(filteredData);
    } catch (error) {
        console.error("GET Error:", error);
        toggleState('errorState', true);
    } finally {
        toggleState('loadingState', false);
    }
}

// Render Helper
function renderList(data) {
    if (data.length === 0) {
        expenseList.innerHTML = '<div class="p-4 text-center text-dark bg-white rounded shadow-sm">No expenses found.</div>';
        return;
    }
    
    data.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <h6 class="mb-0 text-dark">${expense.title} <span class="badge bg-secondary ms-2">${expense.category}</span></h6>
                <small class="text-muted">${expense.date} • ${expense.method}</small>
            </div>
            <span class="fw-bold text-danger">Rs. ${expense.amount}</span>
        `;
        expenseList.appendChild(item);
    });
}

// Form Validation & Submission (POST)
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let isValid = true;
    const fields = ['title', 'amount', 'category', 'date', 'method'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        const err = document.getElementById(`${field}Err`);
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            err.classList.remove('d-none');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            err.classList.add('d-none');
        }
    });

    if (!isValid) return;

    const newExpense = {
        title: document.getElementById('title').value.trim(),
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        method: document.getElementById('method').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newExpense)
        });

        if (response.ok) {
            expenseForm.reset();
            await fetchExpenses(filterCategory.value);
        } else {
            alert("Failed to save! JSON Server rejected the request.");
        }
    } catch (error) {
        console.error("POST Error:", error);
        alert("Cannot connect to server. Did you close your terminal running json-server?");
    }
});

// Filter Event
filterCategory.addEventListener('change', (e) => fetchExpenses(e.target.value));

// Init
fetchExpenses();