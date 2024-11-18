// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const NOTES_FILE = 'data/notes.json';

// Create data directory if it doesn't exist
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Create notes.json if it doesn't exist
if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify({ notes: [] }, null, 2));
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('public/index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    else if (req.method === 'GET' && req.url === '/styles.css') {
        fs.readFile('public/styles.css', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading styles.css');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    }
    else if (req.method === 'GET' && req.url === '/script.js') {
        fs.readFile('public/script.js', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading script.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(data);
        });
    }
    else if (req.method === 'GET' && req.url === '/raw-json') {
        // Serve the raw JSON file
        fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading JSON file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }
    else if (req.method === 'POST' && req.url === '/update-json') {
        // Update the JSON file
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const jsonData = JSON.parse(body);
                fs.writeFile(NOTES_FILE, JSON.stringify(jsonData, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error updating JSON file');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('JSON file updated successfully');
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid JSON format');
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/api/notes') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const noteData = JSON.parse(body);
                fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading notes file');
                        return;
                    }

                    const jsonData = JSON.parse(data);
                    const newNote = {
                        id: Date.now().toString(),
                        title: noteData.title,
                        content: noteData.content,
                        createdAt: new Date().toISOString()
                    };

                    jsonData.notes.push(newNote);

                    fs.writeFile(NOTES_FILE, JSON.stringify(jsonData, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error saving note');
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Note created successfully');
                    });
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid request');
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

