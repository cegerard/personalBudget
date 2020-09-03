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
    console.error('Can\'t reach server', this.response);
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
    console.error('Can\'t reach server', this.response);
  };

  // TODO make load action feedback
  request.send();
}
