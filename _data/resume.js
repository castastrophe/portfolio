import DatabaseConnection from "../utilities/mysql/index.js";

/**
 * Get the default resume variant for static rendering; the others will be created as dynamic pages.
 * @returns {Promise<Object>} The default resume variant.
 */
export default async function () {
	const connection = new DatabaseConnection({
		host     : process.env.MYSQL_HOST,
		port     : process.env.MYSQL_PORT,
		user     : process.env.MYSQL_USER,
		password : process.env.MYSQL_PASS,
		database : process.env.MYSQL_DB,
	});

	if (!connection) return {};

	const QUERY = `SELECT slug, tagline, addressee, cover_letter, about,
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

	const results = await connection.query(QUERY).catch((err) => {
		console.error(err);
	});

	await connection.close();

	if (!results) return {};

	// Lets group skills by category so we have one category and multiple skills
	return results.reduce((rows, row) => {
		if (!row.skills) return rows;
		const categories = {};

		for (const { category, items = [] } of row.skills) {
			categories[category] = items;
		}

		for (const [category, items] of Object.entries(categories)) {
			rows[category] = items;
		}

		return rows;
	}, {});
};
