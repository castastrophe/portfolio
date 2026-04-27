import { getStore } from "@netlify/blobs";

/**
 * Fetch CSSWG activity data from Netlify Blobs.
 *
 * The data is uploaded daily by the fetch_csswg_activity.py script
 * and follows the csswg-activity-schema.json structure.
 *
 * @returns {Promise<Object|null>} The CSSWG activity data, or null if unavailable.
 */
export default async function () {
	let store;
	try {
		store = getStore({
			name: "content",
			siteID: process.env.NETLIFY_SITE_ID,
			token: process.env.NETLIFY_TOKEN,
		});
	} catch (error) {
		console.warn("[csswg] Could not connect to Netlify Blobs:", error.message);
		return null;
	}

	try {
		const data = await store.get("csswg_activity", { type: "json" });

		if (!data) {
			console.warn("[csswg] No csswg_activity data found in blob store");
			return null;
		}

		return data;
	} catch (error) {
		console.warn("[csswg] Failed to read csswg_activity blob:", error.message);
		return null;
	}
}
