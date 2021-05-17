import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.redirect(`${req.baseUrl}/budgets`));

export default router;
