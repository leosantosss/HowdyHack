const express = require('express');
const app = express();
const PORT = 3000;

// Serve everything in the "public" folder
app.use(express.static('public'));

// Example API route (optional)
app.get('/api/message', (req, res) => {
  res.json({ text: 'Hello from Node backend!' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));