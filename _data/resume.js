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

	if (!connection) return [];

	const [experience] = await connection.query(`SELECT company, title, category, summary, start_date, end_date FROM experience`);
	const [resumes] = await connection.query(`SELECT slug, tagline, addressee, cover_letter, about FROM resume_variants`);

	await connection.close();

	if (!resumes && !experience) return [];

	// Lets group skills by category so we have one category and multiple skills
	return resumes.map((resume) => ({ experience, ...resume }));
};
