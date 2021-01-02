const { model } = require('mongoose');

module.exports = {
  list: [
    {
      id: '100',
      name: 'Cmax',
      amount: 41,
      date: '2020-08-29',
      budgetLine: {
        id: '4',
        name: 'Essence',
      },
    },
    {
      id: '101',
      name: 'Ka+',
      amount: 30,
      date: '2020-08-22',
      budgetLine: {
        id: '4',
        name: 'Essence',
      },
    },
    {
      id: '200',
      name: 'courses',
      amount: 61.45,
      date: '2020-10-08',
      budgetLine: {
        id: '1',
        name: 'Course',
      },
    },
  ],
};
