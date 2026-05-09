function calculateSettlement(participants, expenses, expenseSplits) {
  const balances = {};
  participants.forEach(p => {
    balances[p.id] = { name: p.name, balance: 0 };
  });

  expenses.forEach(e => {
    if (balances[e.payer_id]) {
      balances[e.payer_id].balance += parseFloat(e.amount);
    }
  });

  expenseSplits.forEach(s => {
    if (balances[s.participant_id]) {
      balances[s.participant_id].balance -= parseFloat(s.amount_owed);
    }
  });

  const creditors = [];
  const debtors = [];

  for (const id in balances) {
    const { name, balance } = balances[id];
    // Multiply by 100 and round to work with integers (cents) to avoid floating point errors
    const cents = Math.round(balance * 100);
    if (cents > 0) {
      creditors.push({ id, name, amount: cents });
    } else if (cents < 0) {
      debtors.push({ id, name, amount: -cents });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: (amount / 100).toFixed(2)
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  // Return original balances for UI display
  const finalBalances = Object.values(balances).map(b => ({
    name: b.name,
    balance: b.balance.toFixed(2)
  }));

  return { balances: finalBalances, transactions };
}

module.exports = { calculateSettlement };
