import gravatar from 'gravatar';
import { NetlifyAPI } from '@netlify/api';

export default async () => {
	const token = process.env.NETLIFY_AUTH_TOKEN;
	const siteId = process.env.NETLIFY_SITE_ID;

	if (!token || !siteId) {
		console.warn("No Netlify API credentials found.");
		return [];
	}

	const api = new NetlifyAPI(token);
	const submissions = await api.listFormSubmissions({ formId: 'approved-comments', limit: 100 });

	return submissions.map((submission) => ({
		name: submission.name,
		avatar: submission.email ? gravatar.url(submission.email, { s: '100', r: 'x', d: 'retro' }, true) : null,
		comment: submission.data?.comment?.trim(),
		website: submission.data?.website,
		date: new Date(submission.created_at).toISOString(),
		id: submission.id,
	}));
};
