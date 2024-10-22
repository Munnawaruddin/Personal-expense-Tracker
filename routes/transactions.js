const express = require('express');
const router = express.Router();
const db = require('../db');

// Add a new transaction
router.post('/', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const query = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;

    db.run(query, [type, category, amount, date, description], function (err) {
        if (err) {
            res.status(500).json({ error: 'Failed to add transaction' });
        } else {
            res.status(201).json({ id: this.lastID});
        }
    });
});

// Get all transactions
router.get('/', (req, res) => {
    db.all('SELECT * FROM transactions', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve transactions' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// Get transaction by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve transaction' });
        } else if (!row) {
            res.status(404).json({ error: 'Transaction not found' });
        } else {
            res.status(200).json(row);
        }
    });
});

// Update transaction by ID
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { type, category, amount, date, description } = req.body;

    const query = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;

    db.run(query, [type, category, amount, date, description, id], function (err) {
        if (err) {
            res.status(500).json({ error: 'Failed to update transaction' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Transaction not found' });
        } else {
            res.status(200).json({ message: 'Transaction updated successfully' });
        }
    });
});

// Delete transaction by ID
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: 'Failed to delete transaction' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Transaction not found' });
        } else {
            res.status(200).json({ message: 'Transaction deleted successfully' });
        }
    });
});

// Get summary (total income, total expenses, balance)
router.get('/summary', (req, res) => {
    db.all(`
        SELECT type, SUM(amount) as total
        FROM transactions
        GROUP BY type
    `, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve summary' });
        } else {
            const income = rows.find(row => row.type === 'income')?.total || 0;
            const expenses = rows.find(row => row.type === 'expense')?.total || 0;
            const balance = income - expenses;

            res.status(200).json({ income, expenses, balance });
        }
    });
});

module.exports = router;
