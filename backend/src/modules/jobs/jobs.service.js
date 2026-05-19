const Job = require('../../models/Job');
const Proposal = require('../../models/Proposal');
const Contract = require('../../models/Contract');

const jobsService = {
  async listJobs(query) {
    const page  = Math.max(1, parseInt(query.page)  || 1);
    const limit = Math.min(50, parseInt(query.limit) || 10);

    const { jobs, total } = await Job.findAll({
      search:     query.search     || null,
      category:   query.category   || null,
      location:   query.location   || null,
      budget_min: query.budget_min || null,
      budget_max: query.budget_max || null,
      sort:       query.sort       || 'newest',
      page,
      limit,
    });

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async createJob(employerId, data) {
    const jobId = await Job.create({ employer_id: employerId, ...data });
    return Job.findById(jobId);
  },

  async getJob(id) {
    const job = await Job.findById(id);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    return job;
  },

  async submitProposal(jobId, freelancerId, data) {
    const job = await Job.findById(jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    if (job.status === 'closed') {
      const err = new Error('This job is no longer accepting proposals');
      err.status = 400;
      throw err;
    }

    const duplicate = await Proposal.existsByJobAndFreelancer(jobId, freelancerId);
    if (duplicate) {
      const err = new Error('You have already submitted a proposal for this job');
      err.status = 409;
      throw err;
    }

    const proposalId = await Proposal.create({
      job_id: jobId,
      freelancer_id: freelancerId,
      ...data,
    });
    return Proposal.findById(proposalId);
  },

  async acceptProposal(jobId, proposalId, employerId) {
    const job = await Job.findById(jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    if (job.employer_id !== employerId) {
      const err = new Error('You do not own this job');
      err.status = 403;
      throw err;
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      const err = new Error('Proposal not found');
      err.status = 404;
      throw err;
    }
    if (proposal.job_id !== job.id) {
      const err = new Error('Proposal does not belong to this job');
      err.status = 400;
      throw err;
    }
    if (proposal.status !== 'pending') {
      const err = new Error(`Proposal is already ${proposal.status}`);
      err.status = 400;
      throw err;
    }

    await Proposal.acceptProposal(proposalId, jobId);

    const contractId = await Contract.create({
      job_id:        jobId,
      proposal_id:   proposalId,
      employer_id:   employerId,
      freelancer_id: proposal.freelancer_id,
      agreed_budget: proposal.proposed_budget,
    });

    return Contract.findById(contractId);
  },
};

module.exports = jobsService;
