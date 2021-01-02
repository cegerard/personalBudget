module.exports = {
    list: [
        {
          _id: '1',
          name: 'Electricité',
          slug: 'electricite',
          amount: 58,
          description: 'Dépenses liées au contrat d\'électricité de la maison',
          available: 58,
          expenses: []
        },
        {
          _id: '2',
          name: 'Crédit voiture',
          slug: 'credit-voiture',
          amount: 369.89,
          description: 'Dépenses liées au crédit des voitures',
          available: 369.89,
          expenses: []
        },
        {
          _id: '3',
          name: 'Crédit immobilier',
          slug: 'credit-immobilier',
          amount: 857.12,
          description: 'Dépenses liées au crédit de la maison',
          available: 857.12,
          expenses: []
        },
        {
          _id: '4',
          name: 'Essence',
          slug: 'essence',
          amount: 150,
          description: 'Dépenses concernant l\'essence des voitures',
          available: 79,
          expenses: [
            {
              _id: '100',
              name: 'Cmax',
              amount: 41,
              date: '2020-08-29'
            },
            {
              _id: '101',
              name: 'Ka+',
              amount: 30,
              date: '2020-08-22'
            }
          ]
        },
        {
          _id: '5',
          name: 'Assurance voiture',
          slug: 'assurance-voiture',
          amount: 127,
          description:'Assurance des voitures',
          available: 127,
          expenses: []
        },
        {
          _id: '6',
          name: 'Alimentation',
          slug: 'alimentation',
          amount: 500,
          description: 'Dépenses concernant l\'alimentation (boucher, laitier, primeur et supermarché)',
          available: 500,
          expenses: []
        },
        {
          _id: '7',
          name: 'Animaux',
          slug: 'animaux',
          amount: 120,
          description: 'Dépenses pour les chats',
          available: 120,
          expenses: []
        },
        {
          _id: '8',
          name: 'Enfants',
          slug: 'enfants',
          amount: 0,
          available: 0,
          expenses: []
        }
      ]
      
}