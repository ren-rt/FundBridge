const pool = require('../../config/db');

exports.createFounder = async (data) => {
  const {
    user_id,
    full_name,
    company,
    industry,
    stage,
    country,
    region,
    funding_amount,
    description,
    experience,
    linkedin_url,
    photo_url,
  } = data;

  const result = await pool.query(
    `INSERT INTO profiles (
      user_id,
      role,
      full_name,
      company,
      industry,
      stage,
      country,
      region,
      funding_amount,
      description,
      experience,
      linkedin_url,
      photo_url
    )
    VALUES (
      $1,
      'FOUNDER',
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12
    )
    ON CONFLICT (user_id, role)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      company = EXCLUDED.company,
      industry = EXCLUDED.industry,
      stage = EXCLUDED.stage,
      country = EXCLUDED.country,
      region = EXCLUDED.region,
      funding_amount = EXCLUDED.funding_amount,
      description = EXCLUDED.description,
      experience = EXCLUDED.experience,
      linkedin_url = EXCLUDED.linkedin_url,
      photo_url = EXCLUDED.photo_url,
      updated_at = NOW()
    RETURNING *`,
    [
      user_id,
      full_name,
      company,
      industry,
      stage,
      country,
      region,
      funding_amount || null,
      description,
      experience,
      linkedin_url || null,
      photo_url || null,
    ]
  );

  return result.rows[0];
};

exports.getFounderByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM profiles
     WHERE user_id = $1
       AND role = 'FOUNDER'
     LIMIT 1`,
    [userId]
  );

  return result.rows[0] || null;
};

exports.getFounder = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM profiles
     WHERE id = $1
       AND role = 'FOUNDER'`,
    [id]
  );

  return result.rows[0] || null;
};

exports.listFounders = async () => {
  const result = await pool.query(
    `SELECT *
     FROM profiles
     WHERE role = 'FOUNDER'`
  );

  return result.rows;
};

exports.updateFounder = async (id, data) => {
  const {
    full_name,
    company,
    industry,
    stage,
    country,
    region,
    funding_amount,
    description,
    experience,
    linkedin_url,
    photo_url,
  } = data;

  const result = await pool.query(
    `UPDATE profiles
     SET
       full_name = $1,
       company = $2,
       industry = $3,
       stage = $4,
       country = $5,
       region = $6,
       funding_amount = $7,
       description = $8,
       experience = $9,
       linkedin_url = $10,
       photo_url = $11,
       updated_at = NOW()
     WHERE id = $12
       AND role = 'FOUNDER'
     RETURNING *`,
    [
      full_name,
      company,
      industry,
      stage,
      country,
      region,
      funding_amount || null,
      description,
      experience,
      linkedin_url || null,
      photo_url || null,
      id,
    ]
  );

  return result.rows[0] || null;
};