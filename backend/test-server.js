const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Mock data
const mockInventory = [
  { id: 1, part_number: 'ABC-123', description: 'Test Widget A', location: 'A1-B2', quantity: 50, is_accurate: true },
  { id: 2, part_number: 'DEF-456', description: 'Test Gadget B', location: 'C3-D4', quantity: 25, is_accurate: true },
  { id: 3, part_number: 'GHI-789', description: 'Test Device C', location: 'E5-F6', quantity: 100, is_accurate: false },
];

const mockQuotes = [
  {
    id: 1,
    email_id: 'test-email-1',
    sender_email: 'customer@example.com',
    sender_name: 'Test Customer',
    subject: 'Quote Request for ABC-123',
    body: 'Please provide pricing for part ABC-123',
    part_numbers: ['ABC-123'],
    status: 'pending',
    created_at: new Date()
  }
];

// Routes
app.get('/api/auth/me', (req, res) => {
  res.json({ 
    id: 1, 
    email: 'test@example.com', 
    display_name: 'Test User',
    microsoft_id: 'test-id'
  });
});

app.get('/api/inventory/items', (req, res) => {
  res.json(mockInventory);
});

app.post('/api/inventory/search', (req, res) => {
  const { partNumbers } = req.body;
  const results = mockInventory.filter(item => 
    partNumbers.some(pn => item.part_number.includes(pn))
  );
  res.json(results);
});

app.get('/api/emails/quotes', (req, res) => {
  res.json(mockQuotes);
});

app.get('/api/emails/quotes/:id', (req, res) => {
  const quote = mockQuotes.find(q => q.id === parseInt(req.params.id));
  if (quote) {
    res.json(quote);
  } else {
    res.status(404).json({ error: 'Quote not found' });
  }
});

app.post('/api/emails/sync', (req, res) => {
  res.json({ 
    message: 'Email sync simulated', 
    quotesFound: 2,
    newQuotes: [
      {
        id: 2,
        sender_email: 'newcustomer@example.com',
        subject: 'Need DEF-456 and GHI-789',
        part_numbers: ['DEF-456', 'GHI-789']
      }
    ]
  });
});

app.post('/api/inventory/sync', (req, res) => {
  res.json({ 
    message: 'Inventory sync simulated', 
    itemsUpdated: mockInventory.length 
  });
});

// Auth routes (simplified for testing)
app.get('/api/auth/login', (req, res) => {
  res.json({ url: 'http://localhost:3001/api/auth/test-callback' });
});

app.get('/api/auth/test-callback', (req, res) => {
  res.redirect('http://localhost:3000/auth/success?token=test-token-123');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('This is a mock server for testing the UI without Azure/PostgreSQL setup');
});