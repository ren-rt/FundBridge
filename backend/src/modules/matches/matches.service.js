const pool = require('../../config/db');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function logMatch(founderProfileId, investorProfileId, match) {
  await pool.query(
    `INSERT INTO match_logs (founder_profile_id, investor_profile_id, match_score, nlp_sim, explanation_tags)
     VALUES ($1, $2, $3, $4, $5)`,
    [founderProfileId, investorProfileId, match.match_score, match.nlp_sim ?? null, JSON.stringify(match.explanation_tags || [])]
  );
}

exports.getMatchesForFounder = async (founderId) => {
  const founderResult = await pool.query(
    `SELECT * FROM profiles WHERE id = $1 AND role = 'FOUNDER'`,
    [founderId]
  );
  const founder = founderResult.rows[0];
  if (!founder) throw new Error('Founder not found');

  const investorsResult = await pool.query(
    `SELECT * FROM profiles WHERE role = 'INVESTOR'`
  );
  const investors = investorsResult.rows;

  const payload = {
    founder: {
      id: founder.id,
      stage: founder.stage,
      industry: founder.industry,
      region: founder.region,
      funding_amount: founder.funding_amount,
      description: founder.description,
    },
    investors: investors.map((inv) => ({
      id: inv.id,
      firm_name: inv.firm_name,
      primary_domain: inv.primary_domain,
      secondary_domains: inv.secondary_domains || [],
      stage_pref: inv.stage_pref || [],
      region: inv.location,
      ticket_min: inv.ticket_min,
      ticket_max: inv.ticket_max,
      investment_thesis: inv.investment_thesis,
    })),
  };

 let response;
  try {
    response = await axios.post(`${ML_SERVICE_URL}/match`, payload);
  } catch (err) {
    throw new Error('ML matching service is unavailable — is the FastAPI server running?');
  }

  const matches = response.data.matches;
  for (const match of matches) {
    await logMatch(founder.id, match.investor_id, match);
  }

  return matches;
};


exports.getMatchesForInvestor = async (investorId) => {
  const investorResult = await pool.query(
    `SELECT * FROM profiles WHERE id = $1 AND role = 'INVESTOR'`,
    [investorId]
  );
  const investor = investorResult.rows[0];
  if (!investor) throw new Error('Investor not found');

  const foundersResult = await pool.query(
    `SELECT DISTINCT p.*
     FROM profiles p
     JOIN pitches pi ON pi.profile_id = p.id
     WHERE p.role = 'FOUNDER' AND pi.status = 'SUBMITTED'`
  );
  const founders = foundersResult.rows;

  const investorPayload = {
    id: investor.id,
    firm_name: investor.firm_name,
    primary_domain: investor.primary_domain,
    secondary_domains: investor.secondary_domains || [],
    stage_pref: investor.stage_pref || [],
    region: investor.location,
    ticket_min: investor.ticket_min,
    ticket_max: investor.ticket_max,
    investment_thesis: investor.investment_thesis,
  };

  const results = await Promise.all(
    founders.map(async (founder) => {
      const payload = {
        founder: {
          id: founder.id,
          stage: founder.stage,
          industry: founder.industry,
          region: founder.region,
          funding_amount: founder.funding_amount,
          description: founder.description,
        },
        investors: [investorPayload],
      };

      let response;
      try {
        response = await axios.post(`${ML_SERVICE_URL}/match`, payload);
      } catch (err) {
        throw new Error('ML matching service is unavailable — is the FastAPI server running?');
      }

      const match = response.data.matches[0];
      await logMatch(founder.id, investor.id, match);

      return {
        founder_id: founder.id,
        company: founder.company,
        match_score: match.match_score,
        nlp_sim: match.nlp_sim,
        explanation_tags: match.explanation_tags,
      };
    })
  );

  results.sort((a, b) => b.match_score - a.match_score);
  return results;
};

exports.getMatchLogs = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ml.*
     FROM match_logs ml
     JOIN profiles p ON p.id = ml.founder_profile_id OR p.id = ml.investor_profile_id
     WHERE p.user_id = $1
     ORDER BY ml.computed_at DESC
     LIMIT 50`,
    [userId]
  );
  return rows;
};