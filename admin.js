const API_URL = 'http://localhost:3000/expenses';
const tableBody = document.getElementById('adminTableBody');
const editSection = document.getElementById('editSection');
const editForm = document.getElementById('editForm');

async function fetchAllAdmin() {
    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        renderAdminTable(data);
        calculateStats(data);
    } catch (error) {
        document.getElementById('adminError').classList.remove('d-none');
    }
}

function calculateStats(data) {
    const count = data.length;
    const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const avg = count === 0 ? 0 : (total / count);

    document.getElementById('statCount').innerText = count;
    document.getElementById('statTotal').innerText = `Rs. ${total.toFixed(2)}`;
    document.getElementById('statAvg').innerText = `Rs. ${avg.toFixed(2)}`;
}

function renderAdminTable(data) {
    tableBody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.title}</td>
            <td class="fw-bold text-danger">Rs. ${item.amount}</td>
            <td><span class="badge bg-secondary">${item.category}</span></td>
            <td>${item.date}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-2" onclick="loadEdit('${item.id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteResource('${item.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function deleteResource(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchAllAdmin();
        } catch (error) {
            document.getElementById('adminError').classList.remove('d-none');
        }
    }
}

async function loadEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { cache: 'no-store' });
        const item = await response.json();
        
        document.getElementById('editId').value = item.id;
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editAmount').value = item.amount;
        document.getElementById('editCategory').value = item.category;
        
        editSection.classList.remove('d-none');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
    }
}

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    
    const existingRes = await fetch(`${API_URL}/${id}`, { cache: 'no-store' });
    const existingData = await existingRes.json();

    const updatedExpense = {
        ...existingData,
        title: document.getElementById('editTitle').value,
        amount: parseFloat(document.getElementById('editAmount').value),
        category: document.getElementById('editCategory').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedExpense)
        });

        if (response.ok) {
            editSection.classList.add('d-none');
            setTimeout(() => {
                fetchAllAdmin();
            }, 100);
        }
    } catch (error) {
        document.getElementById('adminError').classList.remove('d-none');
    }
});

fetchAllAdmin();