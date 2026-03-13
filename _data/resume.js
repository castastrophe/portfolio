import { neon } from "@neondatabase/serverless";

/**
 * Get the default resume variant for static rendering; the others will be created as dynamic pages.
 * @returns {Promise<Object>} The default resume variant.
 */
export default async function () {
	const sql = neon(process.env.NEON_DATABASE_URL);
	const rows = await sql`
		SELECT
			slug,
			tagline,
			addressee,
			cover_letter,
			about,
			(
				WITH skills AS (
					SELECT id, skills.category, array_agg(skills.content) as items
					FROM skills GROUP BY category, id
				)
				SELECT
					json_agg(
						json_build_object('category', category, 'items', items)
					)
				FROM skills s
				WHERE s.id = ANY(rv.skills)
			) AS skills,
			(
				SELECT
					json_agg(
						json_build_object(
							'company', e.company,
							'title', e.title,
							'summary', e.summary,
							'category', e.category,
							'start_date', to_char(e.start_date, 'YYYY-MM'::text),
							'end_date', to_char(e.end_date, 'YYYY-MM'::text),
							'highlights', (
								SELECT
									array_agg(eh.content) AS array_agg
								FROM
									experience_highlights eh
								WHERE
									e.id = ANY (eh.experience_id)
								ORDER BY category, end_date NULLS FIRST
							)
						)
						ORDER BY
							(array_position(rv.experience, e.id))
					) AS json_agg
			FROM
				experience e
			WHERE
				e.id = ANY (rv.experience)
		) AS experience
			FROM
				resume_variants rv
	`;

	// Lets group skills by category so we have one category and multiple skills
	const reorganized = rows.map((row) => {
		if (!row.skills) return row;
		const categories = {};

		const skills = [];
		for (const { category, items = [] } of row.skills) {
			categories[category] = items;
		}

		for (const [category, items] of Object.entries(categories)) {
			skills.push({ category, items });
		}
		return { ...row, skills: skills.filter(skill => skill.items.length > 0).sort((a, b) => a.category.localeCompare(b.category)) };
	}, {});
	return reorganized;
};
