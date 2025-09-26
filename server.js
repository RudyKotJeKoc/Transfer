const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files like index.html

// MongoDB Connection
// IMPORTANT: Replace with your actual MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/machine-transfer';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema for Machines
const machineSchema = new mongoose.Schema({
    type: { type: String, required: true },
    number: String,
    serial: String,
    equipment: String,
    hal: String,
    status: { type: String, required: true },
    destination: { type: String, required: true },
    line: String,
    responsible: { type: String, required: true },
    notes: String,
    weight: Number,
    dimensions: String,
    power: Number,
    voltage: String,
    oil: String,
    requirements: String,
    hazmat: String,
    dismantlingDate: Date,
    transportDate: Date,
    installationDate: Date,
    ppapDate: Date,
    transportCompany: String,
    planningNotes: String,
    ceCertificate: String,
    manualLink: String,
    lastUpdated: { type: Date, default: Date.now }
});

const Machine = mongoose.model('Machine', machineSchema);

// --- API Routes ---

// GET all machines
app.get('/api/machines', async (req, res) => {
    try {
        const machines = await Machine.find().sort({ lastUpdated: -1 });
        res.json(machines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single machine by ID
app.get('/api/machines/:id', async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });
        res.json(machine);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new machine
app.post('/api/machines', async (req, res) => {
    // Basic auth check
    if (req.body.authCode !== '112') {
        return res.status(401).json({ message: 'Authorization required' });
    }

    const machine = new Machine({
        ...req.body
    });

    try {
        const newMachine = await machine.save();
        res.status(201).json(newMachine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a machine
app.put('/api/machines/:id', async (req, res) => {
    // Basic auth check
    if (req.body.authCode !== '112') {
        return res.status(401).json({ message: 'Authorization required' });
    }

    try {
        const updatedMachine = await Machine.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: Date.now() }, { new: true });
        if (!updatedMachine) return res.status(404).json({ message: 'Machine not found' });
        res.json(updatedMachine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a machine
app.delete('/api/machines/:id', async (req, res) => {
    // A more secure version would check a token in the headers
    try {
        const machine = await Machine.findByIdAndDelete(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });
        res.json({ message: 'Machine deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Serve Frontend ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});