export async function loadCards() {
    const response = await fetch('/Admin/GetCards');
    const cards = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Cards</h2>
        <button onclick="showAddCardModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add Card
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">CardID</th>
                    <th class="border border-gray-300 p-2">CardName</th>
                    <th class="border border-gray-300 p-2">ListID</th>
                    <th class="border border-gray-300 p-2">Status</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${cards.map(card => `
                    <tr>
                        <td class="border border-gray-300 p-2">${card.cardID}</td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" value="${card.cardName}" onchange="updateCard(${card.cardID}, 'CardName', this.value)" />
                        </td>
                        <td class="border border-gray-300 p-2">${card.listID}</td>
                        <td class="border border-gray-300 p-2">
                            <select onchange="updateCard(${card.cardID}, 'Status', this.value)">
                                <option value="To Do" ${card.status === 'To Do' ? 'selected' : ''}>To Do</option>
                                <option value="Done" ${card.status === 'Done' ? 'selected' : ''}>Done</option>
                            </select>
                        </td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteCard(${card.cardID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export async function updateCard(cardID, field, value) {
    await fetch('/Admin/UpdateCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardID, field, value })
    });
    alert('Card updated successfully!');
    loadCards();
}

export async function deleteCard(cardID) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    await fetch('/Admin/DeleteCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardID })
    });
    alert('Card deleted successfully!');
    loadCards();
}

export function showAddCardModal() {
    const modal = document.getElementById('addCardModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddCardModal() {
    const modal = document.getElementById('addCardModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addCard() {
    const cardName = document.getElementById('newCardName').value.trim();
    const listID = document.getElementById('newCardListID').value.trim();
    const status = document.getElementById('newCardStatus').value;

    if (!cardName || !listID || !status) {
        alert('All fields are required!');
        return;
    }

    await fetch('/Admin/AddCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName, listID, status })
    });

    alert('Card added successfully!');
    closeAddCardModal();
    loadCards();
}