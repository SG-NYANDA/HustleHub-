const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { roundMoney } = require('../utils/money');
const { ROLES } = require('../utils/constants');

function scopeFor(user) {
  if (user.role === ROLES.CLIENT) return { client: user.id };
  if (user.role === ROLES.FREELANCER) return { freelancer: user.id };
  return {};
}

// GET /api/transactions  (client | freelancer | admin) - role-scoped:
// clients see what they paid, freelancers what they earned, admins everything.
async function listTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find(scopeFor(req.user))
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('client', 'name')
      .populate('freelancer', 'name');
    res.status(200).json({ success: true, data: { transactions } });
  } catch (err) {
    next(err);
  }
}

// GET /api/transactions/income  (freelancer) - income earned from bookings, tied to the logged-in freelancer only
async function getIncomeSummary(req, res, next) {
  try {
    const freelancerId = new mongoose.Types.ObjectId(req.user.id);

    const match = { freelancer: freelancerId, status: 'completed' };
    const [[totals], transactionCount] = await Promise.all([
      Transaction.aggregate([{ $match: match }, { $group: { _id: null, totalEarned: { $sum: '$amount' } } }]),
      Transaction.countDocuments(match),
    ]);

    const totalEarned = roundMoney(totals ? totals.totalEarned : 0);

    const recent = await Transaction.find({ freelancer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name');

    res.status(200).json({
      success: true,
      data: {
        currency: 'ZAR',
        totalEarned,
        transactionCount,
        averagePerBooking: transactionCount ? roundMoney(totalEarned / transactionCount) : 0,
        recentTransactions: recent,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTransactions, getIncomeSummary };
