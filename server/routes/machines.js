const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// GET /api/machines - Get all machines with optional filters
router.get('/', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            destination: req.query.destination,
            responsible: req.query.responsible,
            search: req.query.search
        };

        const machines = await Machine.getAll(filters);

        res.json({
            success: true,
            count: machines.length,
            data: machines
        });
    } catch (error) {
        console.error('Get machines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching machines'
        });
    }
});

// GET /api/machines/statistics - Get statistics
router.get('/statistics', async (req, res) => {
    try {
        const stats = await Machine.getStatistics();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// GET /api/machines/:id - Get machine by ID
router.get('/:id', async (req, res) => {
    try {
        const machine = await Machine.getById(req.params.id);

        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        res.json({
            success: true,
            data: machine
        });
    } catch (error) {
        console.error('Get machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching machine'
        });
    }
});

// GET /api/machines/:id/history - Get machine history
router.get('/:id/history', async (req, res) => {
    try {
        const history = await Machine.getHistory(req.params.id);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching machine history'
        });
    }
});

// POST /api/machines - Create new machine
router.post('/', async (req, res) => {
    try {
        const machineData = req.body;

        // Validate required fields
        if (!machineData.type || !machineData.status || !machineData.responsible) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: type, status, responsible'
            });
        }

        const newMachine = await Machine.create(machineData, req.user.id);

        res.status(201).json({
            success: true,
            message: 'Machine created successfully',
            data: newMachine
        });
    } catch (error) {
        console.error('Create machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating machine'
        });
    }
});

// PUT /api/machines/:id - Update machine
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;

        // Check if machine exists
        const machine = await Machine.getById(req.params.id);

        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        const result = await Machine.update(req.params.id, updates, req.user.id);

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes made'
            });
        }

        // Fetch updated machine
        const updatedMachine = await Machine.getById(req.params.id);

        res.json({
            success: true,
            message: 'Machine updated successfully',
            data: updatedMachine
        });
    } catch (error) {
        console.error('Update machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating machine'
        });
    }
});

// DELETE /api/machines/:id - Delete machine
router.delete('/:id', async (req, res) => {
    try {
        // Check if machine exists
        const machine = await Machine.getById(req.params.id);

        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        await Machine.delete(req.params.id, req.user.id);

        res.json({
            success: true,
            message: 'Machine deleted successfully'
        });
    } catch (error) {
        console.error('Delete machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting machine'
        });
    }
});

module.exports = router;
