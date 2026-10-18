import pool from "../config/db.config.js";

export const findByAssignmentAndMember = async (assignmentId, memberId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM submissions
    WHERE assignment_id = $1
      AND member_id = $2
    `,
    [assignmentId, memberId],
  );

  return result.rows[0] || null;
};

export const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM submissions
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const findAllByAssignmentId = async (assignmentId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM submissions
    WHERE assignment_id = $1
    ORDER BY submitted_at DESC, id DESC
    `,
    [assignmentId],
  );

  return result.rows;
};

export const findAllByMemberId = async (memberId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM submissions
    WHERE member_id = $1
    ORDER BY submitted_at DESC, id DESC
    `,
    [memberId],
  );

  return result.rows;
};

export const upsert = async ({
  assignmentId,
  memberId,
  content,
  repositoryUrl,
}) => {
  const result = await pool.query(
    `
    INSERT INTO submissions (
      assignment_id,
      member_id,
      content,
      repository_url
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (assignment_id, member_id)
    DO UPDATE SET
      content = EXCLUDED.content,
      repository_url = EXCLUDED.repository_url,
      submitted_at = CURRENT_TIMESTAMP,
      score = NULL,
      feedback = NULL,
      reviewed_by = NULL,
      reviewed_at = NULL
    RETURNING *
    `,
    [assignmentId, memberId, content ?? null, repositoryUrl ?? null],
  );

  return result.rows[0];
};

export const review = async (id, { score, feedback, reviewedBy }) => {
  const result = await pool.query(
    `
    UPDATE submissions
    SET 
      score = $1,
      feedback = $2,
      reviewed_by = $3,
      reviewed_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [score, feedback ?? null, reviewedBy, id],
  );

  return result.rows[0] || null;
};
