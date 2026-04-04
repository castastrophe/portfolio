import { getStore } from "@netlify/blobs";

/**
 * Get all resume variants with their associated experience and skills.
 * The default (index) variant is used for static rendering;
 * the others are created as dynamic pages.
 * @returns {Promise<Object[]>} Array of resume variant objects.
 */
export default async function () {
	let store;
	try {
		store = getStore({
		name: 'content',
		siteID: process.env.NETLIFY_SITE_ID,
		token: process.env.NETLIFY_TOKEN,
		});
	} catch (error) {
		console.error('Error getting store:', error);
		throw error;
	}

	const [experience, resumes, skills, variantSkills] = await Promise.all([
		store.get('experience', { type: 'json' }),
		store.get('resume_variants', { type: 'json' }),
		store.get('skills', { type: 'json' }),
		store.get('resume_variant_skills', { type: 'json' }),
	]);

	if (!resumes || !experience) return [];

	const skillsById = Object.fromEntries((skills ?? []).map(s => [s.id, s]));

	return resumes.map((resume) => {
		const resumeSkills = (variantSkills ?? [])
			.filter(rvs => rvs.resume_slug === resume.slug)
			.sort((a, b) => a.sort_order - b.sort_order)
			.map(rvs => skillsById[rvs.skill_id])
			.filter(Boolean);

		return { experience, skills: resumeSkills, ...resume };
	});
}
