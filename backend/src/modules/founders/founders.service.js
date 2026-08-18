const pool = require('../../config/db');

exports.createFounder = async (data) => {
  const {
    user_id,
    full_name,
    bio,
    skills,
    experience,
    linkedin_url,
    photo_url,
    company,
    industry,
    stage,
    country,
    region,
    funding_amount,
    description,
  } = data;

  const result = await pool.query(
    `INSERT INTO profiles (
      user_id,
      role,
      full_name,
      bio,
      skills,
      experience,
      linkedin_url,
      photo_url,
      company,
      industry,
      stage,
      country,
      region,
      funding_amount,
      description
    )
    VALUES (
      $1, 'FOUNDER', $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14
    )
    ON CONFLICT (user_id, role) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      bio = EXCLUDED.bio,
      skills = EXCLUDED.skills,
      experience = EXCLUDED.experience,
      linkedin_url = EXCLUDED.linkedin_url,
      photo_url = EXCLUDED.photo_url,
      company = EXCLUDED.company,
      industry = EXCLUDED.industry,
      stage = EXCLUDED.stage,
      country = EXCLUDED.country,
      region = EXCLUDED.region,
      funding_amount = EXCLUDED.funding_amount,
      description = EXCLUDED.description,
      updated_at = now()
    RETURNING *`,
    [
      user_id,
      full_name,
      bio,
      skills,
      experience,
      linkedin_url || null,
      photo_url || null,
      company || null,
      industry || null,
      stage || null,
      country || null,
      region || null,
      funding_amount || null,
      description || null,
    ]
  );

  return result.rows[0];
};

exports.getFounder = async (id) => {
  const result = await pool.query(
    `SELECT * FROM profiles
     WHERE id = $1 AND role = 'FOUNDER'`,
    [id]
  );

  return result.rows[0];
};

exports.listFounders = async () => {
  const result = await pool.query(
    `SELECT * FROM profiles
     WHERE role = 'FOUNDER'`
  );

  return result.rows;
};

exports.updateFounder = async (id, data) => {
  const {
    full_name,
    bio,
    skills,
    experience,
    linkedin_url,
    photo_url,
    company,
    industry,
    stage,
    country,
    region,
    funding_amount,
    description,
  } = data;

  const result = await pool.query(
    `UPDATE profiles
     SET
       full_name = $1,
       bio = $2,
       skills = $3,
       experience = $4,
       linkedin_url = $5,
       photo_url = $6,
       company = $7,
       industry = $8,
       stage = $9,
       country = $10,
       region = $11,
       funding_amount = $12,
       description = $13,
       updated_at = now()
     WHERE id = $14
       AND role = 'FOUNDER'
     RETURNING *`,
    [
      full_name,
      bio,
      skills,
      experience,
      linkedin_url || null,
      photo_url || null,
      company || null,
      industry || null,
      stage || null,
      country || null,
      region || null,
      funding_amount || null,
      description || null,
      id,
    ]
  );

  return result.rows[0];
};