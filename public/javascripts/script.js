function deleteBudgetLine(attr) {
  const request = new XMLHttpRequest();
  request.open('DELETE', `/budgets/${attr}`, true);

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      window.location.replace('/budgets');
    } else {
      // We reached our target server, but it returned an error
      console.error('ERROR', this.response);
    }
  };

  request.onerror = function () {
    // There was a connection error of some sort
    console.error("Can't reach server", this.response);
  };

  // TODO make load action feedback
  request.send();
}

function deleteExpense(attr) {
  const request = new XMLHttpRequest();
  request.open('DELETE', `/expenses/${attr}`, true);

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      window.location.replace('/expenses');
    } else {
      // We reached our target server, but it returned an error
      console.error('ERROR', this.response);
    }
  };

  request.onerror = function () {
    // There was a connection error of some sort
    console.error("Can't reach server", this.response);
  };

  // TODO make load action feedback
  request.send();
}

function filterExpenseOnBudgetName() {
  const budgetNameQuery = document.getElementById('expense-filter').value;
  if (budgetNameQuery === '') {
    window.location.replace('/expenses');
  } else {
    window.location.replace(`/expenses/filter?budgetName=${budgetNameQuery}`);
  }
}

function budgetTypeChange() {
  newBudgetType = document.forms[0].budgetTypeEdit.value;
  if (newBudgetType === 'RESERVE') {
    document.getElementById('reserveAttributes').classList.remove('d-none');
  } else {
    document.getElementById('reserveAttributes').classList.add('d-none');
  }
}
