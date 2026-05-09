function calculateSettlement(participants, expenses) {
  const balances = {};
  participants.forEach(p => {
    balances[p._id.toString()] = { name: p.name, balance: 0 };
  });

  expenses.forEach(e => {
    const payerId = e.payer.toString();
    const totalAmount = parseFloat(e.amount);
    
    if (balances[payerId]) {
      balances[payerId].balance += totalAmount;
    }

    const numInvolved = e.involvedParticipants.length;
    if (numInvolved > 0) {
      const splitAmount = totalAmount / numInvolved;
      e.involvedParticipants.forEach(pId => {
        const idStr = pId.toString();
        if (balances[idStr]) {
          balances[idStr].balance -= splitAmount;
        }
      });
    }
  });

  const creditors = [];
  const debtors = [];

  for (const id in balances) {
    const { name, balance } = balances[id];
    const cents = Math.round(balance * 100);
    if (cents > 0) {
      creditors.push({ id, name, amount: cents });
    } else if (cents < 0) {
      debtors.push({ id, name, amount: -cents });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

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

  const finalBalances = Object.values(balances).map(b => ({
    name: b.name,
    balance: b.balance.toFixed(2)
  }));

  return { balances: finalBalances, transactions };
}

module.exports = { calculateSettlement };
