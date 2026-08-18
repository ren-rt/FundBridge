const pool = require('../../config/db');

exports.createInvestor = async (data) => {
  const { user_id, firm_name, primary_domain, secondary_domains, stage_pref, ticket_min, ticket_max, location, investment_thesis } = data;
  const result = await pool.query(
    `INSERT INTO profiles (user_id, role, firm_name, primary_domain, secondary_domains, stage_pref, ticket_min, ticket_max, location, investment_thesis)
     VALUES ($1, 'INVESTOR', $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, role) DO UPDATE SET
       firm_name = EXCLUDED.firm_name,
       primary_domain = EXCLUDED.primary_domain,
       secondary_domains = EXCLUDED.secondary_domains,
       stage_pref = EXCLUDED.stage_pref,
       ticket_min = EXCLUDED.ticket_min,
       ticket_max = EXCLUDED.ticket_max,
       location = EXCLUDED.location,
       investment_thesis = EXCLUDED.investment_thesis,
       updated_at = now()
     RETURNING *`,
    [user_id, firm_name, primary_domain, JSON.stringify(secondary_domains || []), JSON.stringify(stage_pref || []), ticket_min, ticket_max, location, investment_thesis]
  );
  return result.rows[0];
};

exports.getInvestor = async (id) => {
  const result = await pool.query(`SELECT * FROM profiles WHERE id = $1 AND role = 'INVESTOR'`, [id]);
  return result.rows[0];
};

exports.listInvestors = async () => {
  const result = await pool.query(`SELECT * FROM profiles WHERE role = 'INVESTOR'`);
  return result.rows;
};

exports.updateInvestor = async (id, data) => {
  const { firm_name, primary_domain, secondary_domains, stage_pref, ticket_min, ticket_max, location, investment_thesis } = data;
  const result = await pool.query(
    `UPDATE profiles SET firm_name=$1, primary_domain=$2, secondary_domains=$3, stage_pref=$4,
     ticket_min=$5, ticket_max=$6, location=$7, investment_thesis=$8, updated_at=now()
     WHERE id=$9 AND role='INVESTOR' RETURNING *`,
    [firm_name, primary_domain, JSON.stringify(secondary_domains || []), JSON.stringify(stage_pref || []), ticket_min, ticket_max, location, investment_thesis, id]
  );
  return result.rows[0];
};