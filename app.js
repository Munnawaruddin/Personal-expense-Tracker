const express = require('express');
const transactionsRouter = require('./routes/transactions');
const app = express();

app.use(express.json());

// Routes
app.use('/transactions', transactionsRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
