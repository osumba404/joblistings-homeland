const Contract = require('../../models/Contract');
const Payment = require('../../models/Payment');

const PLATFORM_FEE_PERCENT = 8;
const FREELANCER_PERCENT = 92;

function generateMpesaReceipt() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let receipt = '';
  for (let i = 0; i < 10; i++) {
    receipt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return receipt;
}

async function getContractOrFail(id) {
  const contract = await Contract.findById(id);
  if (!contract) {
    const err = new Error('Contract not found');
    err.status = 404;
    throw err;
  }
  return contract;
}

const escrowService = {
  async fund(contractId, employerId) {
    const contract = await getContractOrFail(contractId);

    if (contract.employer_id !== employerId) {
      const err = new Error('You do not own this contract');
      err.status = 403;
      throw err;
    }
    if (contract.status !== 'pending') {
      const err = new Error(`Cannot fund a contract with status: ${contract.status}`);
      err.status = 400;
      throw err;
    }

    const receipt = generateMpesaReceipt();
    await Contract.setFunded(contractId, receipt);

    return {
      contract_id:  contractId,
      status:       'funded',
      mpesa_receipt: receipt,
      amount_held:  contract.agreed_budget,
      message:      'Mock M-Pesa payment received. Funds held in escrow.',
    };
  },

  async deliver(contractId, freelancerId) {
    const contract = await getContractOrFail(contractId);

    if (contract.freelancer_id !== freelancerId) {
      const err = new Error('You are not the freelancer on this contract');
      err.status = 403;
      throw err;
    }
    if (contract.status !== 'funded') {
      const err = new Error(`Cannot mark as delivered — contract status is: ${contract.status}`);
      err.status = 400;
      throw err;
    }

    await Contract.setDelivered(contractId);
    return {
      contract_id: contractId,
      status:      'delivered',
      message:     'Work marked as delivered. Awaiting employer approval.',
    };
  },

  // Core approve logic — reused by both the route and autoReleaseEscrow
  async approveAndRelease(contractId, employerId = null) {
    const contract = await getContractOrFail(contractId);

    if (employerId !== null && contract.employer_id !== employerId) {
      const err = new Error('You do not own this contract');
      err.status = 403;
      throw err;
    }
    if (contract.status !== 'delivered') {
      const err = new Error(`Cannot approve — contract status is: ${contract.status}`);
      err.status = 400;
      throw err;
    }

    const total = parseFloat(contract.agreed_budget);
    const freelancerAmount = parseFloat(((FREELANCER_PERCENT / 100) * total).toFixed(2));
    const platformAmount   = parseFloat(((PLATFORM_FEE_PERCENT / 100) * total).toFixed(2));

    await Contract.setReleased(contractId);

    await Promise.all([
      Payment.create({
        contract_id:  contractId,
        recipient_id: contract.freelancer_id,
        amount:       freelancerAmount,
        type:         'freelancer_payout',
      }),
      Payment.create({
        contract_id:  contractId,
        recipient_id: contract.employer_id,
        amount:       platformAmount,
        type:         'platform_fee',
      }),
    ]);

    return {
      contract_id:       contractId,
      status:            'released',
      total_budget:      total,
      freelancer_payout: freelancerAmount,
      platform_fee:      platformAmount,
      message:           'Payment released successfully.',
    };
  },

  async dispute(contractId, userId, reason) {
    const contract = await getContractOrFail(contractId);

    const isParty = contract.employer_id === userId || contract.freelancer_id === userId;
    if (!isParty) {
      const err = new Error('You are not a party to this contract');
      err.status = 403;
      throw err;
    }
    if (!['funded', 'delivered'].includes(contract.status)) {
      const err = new Error(`Cannot dispute a contract with status: ${contract.status}`);
      err.status = 400;
      throw err;
    }

    await Contract.setDisputed(contractId);
    return {
      contract_id: contractId,
      status:      'disputed',
      reason,
      message:     'Dispute raised. The contract is now under review.',
    };
  },
};

module.exports = escrowService;
