
// public/script.js
function loadNotes() {
    fetch('/raw-json')
        .then(response => response.json())
        .then(data => {
            // Update JSON viewer
            document.getElementById('jsonEditor').value = JSON.stringify(data, null, 2);

            // Update notes list
            const notesList = document.getElementById('notesList');
            notesList.innerHTML = '';
            
            if (data.notes.length === 0) {
                notesList.innerHTML = '<p>No notes yet. Create your first note!</p>';
                return;
            }

            // Sort notes by creation date (newest first)
            data.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            data.notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                const createdDate = new Date(note.createdAt).toLocaleString();
                noteElement.innerHTML = `
                    <h3>${note.title}</h3>
                    <div class="note-meta">Created: ${createdDate}</div>
                    <p>${note.content}</p>
                `;
                notesList.appendChild(noteElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

function createNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }

    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        loadNotes();
    })
    .catch(error => console.error('Error:', error));
}

function updateJSON() {
    try {
        const jsonContent = document.getElementById('jsonEditor').value;
        JSON.parse(jsonContent); // Validate JSON format

        fetch('/update-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonContent
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            loadNotes();
        })
        .catch(error => console.error('Error:', error));
    } catch (error) {
        alert('Invalid JSON format: ' + error.message);
    }
}

function formatJSON() {
    try {
        const jsonEditor = document.getElementById('jsonEditor');
        const formattedJSON = JSON.stringify(JSON.parse(jsonEditor.value), null, 2);
        jsonEditor.value = formattedJSON;
    } catch (error) {
        alert('Invalid JSON format: ' + error.message);
    }
}

function refreshJSON() {
    loadNotes();
}

// Load notes when page loads
window.onload = loadNotes;