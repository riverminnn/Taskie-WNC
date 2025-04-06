function openNewListModal(event) {
    const modal = document.getElementById('newListModal');
    const modalContent = document.getElementById('newListModalContent');
    const addListButton = event.currentTarget;

    // Get the position of the "Add another list" button
    const rect = addListButton.getBoundingClientRect();

    // Position the modal at the same location as the button
    modalContent.style.top = `${rect.top + window.scrollY}px`;
    modalContent.style.left = `${rect.left + window.scrollX}px`;

    // Show the modal
    modal.classList.remove('hidden');
}

function closeNewListModal() {
    const modal = document.getElementById('newListModal');
    modal.classList.add('hidden');
}

// Close the modal when clicking outside of it
document.addEventListener('click', function (event) {
    const modal = document.getElementById('newListModal');
    const modalContent = document.getElementById('newListModalContent');

    if (!modalContent.contains(event.target) && !event.target.closest('#addListButton')) {
        closeNewListModal();
    }
});

async function fetchLists(boardID) {
    try {
        console.log(boardID); // Log the raw boardID
        const response = await fetch('/User/GetLists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: boardID, // Send boardID as a raw value
        });

        const data = await response.json();

        if (data.success) {
            renderLists(data.lists);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching lists:', error);
    }
}

function renderLists(lists) {
    const listsContainer = document.querySelector('.lists-col'); // Adjust selector to match your container
    listsContainer.innerHTML = ''; // Clear existing lists

    // Render each list
    lists.forEach(list => {
        listsContainer.innerHTML += `
            <div id="list-item"
                class="flex flex-col items-center justify-start bg-[#F1F3F4] gap-2 rounded shadow p-3 cursor-pointer h-28 w-full max-w-[300px]">
                <div class="top-list flex justify-between items-center w-full">
                    <button class="font-bold text-gray-800">
                        ${list.listName}
                    </button>
                    <button id="list-settings"
                        class="flex justify-center items-center px-1 py-1 rounded-sm hover:bg-black/20 size-8 cursor-pointer">
                        <i class="fa-solid fa-ellipsis text-[14px]"></i>
                    </button>
                </div>
            </div>
        `;
    });

    // Add "Add another list" button
    listsContainer.innerHTML += `
        <button onclick="openNewListModal(event)" id="addListButton"
            class="flex items-center justify-start bg-gradient-to-r from-slate-300 gap-2 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-12 w-full max-w-[300px]">
            <i class="fa-solid fa-plus text-gray-600 text-base"></i>
            <span class="block text-base font-semibold text-gray-600">Add another list</span>
        </button>
    `;
}

// Fetch lists when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const boardID = document.getElementById('boardId').value;
    console.log(boardID);
    fetchLists(boardID);
});

async function addList() {
    const listNameInput = document.getElementById('listNameInput');
    const listName = listNameInput.value.trim();
    const boardId = document.getElementById('boardId').value;

    console.log(boardId);


    if (!listName) {
        alert('List name is required!');
        return;
    }

    try {
        const response = await fetch('/User/AddList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listName, boardId }),
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            closeNewListModal();
            fetchLists(boardId); // Refresh the list
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding list:', error);
    }
}