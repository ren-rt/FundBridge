const pool = require('../../config/db');

exports.createFounder = async (data) => {
  const { user_id, company, industry, stage, country, region, funding_amount, description } = data;
  const result = await pool.query(
    `INSERT INTO profiles (user_id, role, company, industry, stage, country, region, funding_amount, description)
     VALUES ($1, 'FOUNDER', $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [user_id, company, industry, stage, country, region, funding_amount, description]
  );
  return result.rows[0];
};

exports.getFounder = async (id) => {
  const result = await pool.query(`SELECT * FROM profiles WHERE id = $1 AND role = 'FOUNDER'`, [id]);
  return result.rows[0];
};

exports.listFounders = async () => {
  const result = await pool.query(`SELECT * FROM profiles WHERE role = 'FOUNDER'`);
  return result.rows;
};

exports.updateFounder = async (id, data) => {
  const { company, industry, stage, country, region, funding_amount, description } = data;
  const result = await pool.query(
    `UPDATE profiles SET company=$1, industry=$2, stage=$3, country=$4, region=$5,
     funding_amount=$6, description=$7, updated_at=now()
     WHERE id=$8 AND role='FOUNDER' RETURNING *`,
    [company, industry, stage, country, region, funding_amount, description, id]
  );
  return result.rows[0];
};