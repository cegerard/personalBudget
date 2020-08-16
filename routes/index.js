const express = require('express');
const budgetList = require('../data/budgetList.json'); // TODO replace this by core service layer when available

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => res.redirect(`${req.baseUrl}/budgets`));

router.get('/budgets', (req, res) => {
  res.render('budgets', { page: 'budgets', budgetList });
});

});

module.exports = router;
