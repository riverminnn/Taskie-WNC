export async function loadComments() {
    const response = await fetch('/Admin/GetComments');
    const comments = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Comments</h2>
        <button onclick="showAddCommentModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add Comment
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">CommentID</th>
                    <th class="border border-gray-300 p-2">CardID</th>
                    <th class="border border-gray-300 p-2">UserID</th>
                    <th class="border border-gray-300 p-2">Content</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${comments.map(comment => `
                    <tr>
                        <td class="border border-gray-300 p-2">${comment.commentID}</td>
                        <td class="border border-gray-300 p-2">${comment.cardID}</td>
                        <td class="border border-gray-300 p-2">${comment.userID}</td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" value="${comment.content}" onchange="updateComment(${comment.commentID}, this.value)" />
                        </td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteComment(${comment.commentID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export async function updateComment(commentID, content) {
    await fetch('/Admin/UpdateComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentID, content })
    });
    alert('Comment updated successfully!');
    loadComments();
}

export async function deleteComment(commentID) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    await fetch('/Admin/DeleteComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentID })
    });
    alert('Comment deleted successfully!');
    loadComments();
}

export function showAddCommentModal() {
    const modal = document.getElementById('addCommentModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddCommentModal() {
    const modal = document.getElementById('addCommentModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addComment() {
    const cardID = document.getElementById('newCommentCardID').value.trim();
    const userID = document.getElementById('newCommentUserID').value.trim();
    const content = document.getElementById('newCommentContent').value.trim();

    if (!cardID || !userID || !content) {
        alert('All fields are required!');
        return;
    }

    await fetch('/Admin/AddComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardID, userID, content })
    });

    alert('Comment added successfully!');
    closeAddCommentModal();
    loadComments();
}