const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => res.redirect(`${req.baseUrl}/budgets`));

module.exports = router;
