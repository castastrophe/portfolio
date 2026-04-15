/**
 * Security edge function — runs before redirect rules at the CDN edge.
 *
 * Two layers of protection:
 *
 * 1. Scanner path detection: Any IP that requests a /wp-* URL (WordPress paths
 *    that have no legitimate use on this site) is immediately IP-banned for
 *    30 days in Netlify Blobs and receives a 404. Other known scanner paths
 *    (/.git, /.env, /xmlrpc.php, /phpmyadmin) trigger a 24-hour ban.
 *
 * 2. Ban enforcement: Every non-asset request checks the Blobs ban store. Banned
 *    IPs receive a plain 404 with no content, revealing nothing about the site.
 *
 * Errors fail open — if Blobs is unavailable the request passes through normally
 * so legitimate visitors are never accidentally blocked.
 */

import { getStore } from "@netlify/blobs";

// Paths with no legitimate use on this site — immediate ban on first hit
const WP_PREFIX = "/wp-";

// Other known scanner paths — 24-hour ban on first hit
const SCANNER_PATHS = ["/.git", "/.env", "/xmlrpc.php", "/phpmyadmin"];

// Static asset prefixes/extensions — skip Blobs checks entirely for these
const STATIC_PREFIXES = ["/css/", "/js/", "/images/"];
const STATIC_EXT = /\.(css|js|map|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|eot)(\?.*)?$/i;

/** 30-day ban (seconds) for WordPress scanner paths */
const BAN_TTL_WP = 30 * 24 * 60 * 60;
/** 24-hour ban (seconds) for other scanner paths */
const BAN_TTL_OTHER = 24 * 60 * 60;

const NOT_FOUND = new Response("Not Found\n", {
	status: 404,
	headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
});

function isStaticAsset(pathname) {
	return STATIC_PREFIXES.some((p) => pathname.startsWith(p)) || STATIC_EXT.test(pathname);
}

export default async (request, context) => {
	const { pathname } = new URL(request.url);

	// Skip Blobs overhead for static assets — they can't be "attacked"
	if (isStaticAsset(pathname)) return;

	const ip = context.ip ?? "unknown";

	try {
		const store = getStore("security");
		const banKey = `ban_${ip}`;

		// --- Scanner path detection ---
		if (pathname.startsWith(WP_PREFIX)) {
			// WordPress paths: immediate 30-day ban, no second chances
			await store.set(banKey, JSON.stringify({ reason: "wp-scanner", banned_at: Date.now() }), {
				ttl: BAN_TTL_WP,
			});
			return NOT_FOUND;
		}

		if (SCANNER_PATHS.some((p) => pathname.startsWith(p))) {
			// Other scanner paths: 24-hour ban
			await store.set(banKey, JSON.stringify({ reason: "scanner", banned_at: Date.now() }), {
				ttl: BAN_TTL_OTHER,
			});
			return NOT_FOUND;
		}

		// --- Ban enforcement for all other paths ---
		const banned = await store.get(banKey);
		if (banned) return NOT_FOUND;
	} catch (err) {
		// Fail open: Blobs unavailability must never block legitimate visitors
		console.error("[security] Blobs error:", err?.message);
	}
};

export const config = {
	path: "/*",
};
