const Contract = require('../models/Contract');
const escrowService = require('../modules/escrow/escrow.service');

/**
 * Finds all contracts in 'delivered' status older than 3 days
 * and automatically approves + releases payment for each.
 * Call this from a cron job or a scheduled task.
 */
async function autoReleaseEscrow() {
  const staleContracts = await Contract.findDeliveredOlderThan(3);

  if (staleContracts.length === 0) {
    console.log('[autoRelease] No stale contracts to process.');
    return;
  }

  console.log(`[autoRelease] Found ${staleContracts.length} contract(s) to auto-release.`);

  const results = await Promise.allSettled(
    staleContracts.map((contract) =>
      escrowService.approveAndRelease(contract.id, null)
    )
  );

  results.forEach((result, i) => {
    const id = staleContracts[i].id;
    if (result.status === 'fulfilled') {
      console.log(`[autoRelease] Contract #${id} released. Freelancer received ${result.value.freelancer_payout}`);
    } else {
      console.error(`[autoRelease] Contract #${id} failed: ${result.reason.message}`);
    }
  });
}

module.exports = autoReleaseEscrow;
