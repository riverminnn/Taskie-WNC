import { SELECTORS } from './constants.js';

/**
 * Sets up editing for the board name.
 */
export function setupBoardNameEditing() {
    const boardNameInput = document.querySelector(SELECTORS.BOARD_NAME);
    const originalName = boardNameInput.value;

    // Function to handle the update
    const updateName = async () => {
        const newName = boardNameInput.value.trim();

        // If empty, reset to original name
        if (!newName) {
            boardNameInput.value = originalName;
            return;
        }

        // Only update if name actually changed
        if (newName !== originalName) {
            try {
                const boardId = document.querySelector(SELECTORS.BOARD_ID).value;
                const response = await fetch('/Board/UpdateName', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ boardId, boardName: newName }),
                });

                const data = await response.json();
                if (!data.success) {
                    console.error(data.message);
                    boardNameInput.value = originalName; // Reset on error
                }
            } catch (error) {
                console.error('Error updating board name:', error);
                boardNameInput.value = originalName; // Reset on error
            }
        }
    };

    // Update on blur (clicking outside)
    boardNameInput.addEventListener('blur', updateName);

    // Update on Enter key
    boardNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            boardNameInput.blur(); // This will trigger the blur event
        }
    });
}

/**
 * Deletes the current board after confirmation.
 */
export async function deleteBoard() {
    if (!confirm('Are you sure you want to delete this board and all its lists and cards? This action cannot be undone.')) {
        return;
    }

    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    try {
        const response = await fetch('/Board/Delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardId }),
        });

        const data = await response.json();

        if (data.success) {
            // Redirect to home page after successful deletion
            window.location.href = '/User/Home';
        } else {
            console.error(data.message);
            alert('Failed to delete board: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting board:', error);
        alert('An error occurred while deleting the board');
    }
}

/**
 * Toggles the visibility of the settings dropdown menu.
 */
export function toggleSettingsDropdown() {
    const dropdown = document.getElementById('settings-dropdown');
    dropdown.classList.toggle('hidden');
}