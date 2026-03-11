import { neon } from "@neondatabase/serverless";

/**
 * Get the default resume variant for static rendering; the others will be created as dynamic pages.
 * @returns {Promise<Object>} The default resume variant.
 */
export default async function () {
	const sql = neon(process.env.NEON_DATABASE_URL);
	const rows = await sql`
		SELECT *
		FROM resume_variants
	`;

	return rows;
};
