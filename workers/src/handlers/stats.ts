// Authoritative learner counts for the owner-gated admin. No bind() — fixed COUNT queries.
export async function getStats(db: D1Database): Promise<Response> {
  const count = async (sql: string): Promise<number> =>
    (await db.prepare(sql).first<{ c: number }>())?.c ?? 0

  const total = await count('SELECT COUNT(*) AS c FROM users')
  const learners = await count('SELECT COUNT(DISTINCT user_id) AS c FROM progress')
  const intakeCompleted = await count("SELECT COUNT(*) AS c FROM intake_profiles WHERE status = 'completed'")

  return Response.json({ total, learners, intakeCompleted })
}
