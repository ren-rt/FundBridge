const pool = require('../../config/db');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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
  return response.data.matches;
};