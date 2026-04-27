const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");
const { getOctokit } = require("@actions/github");

async function run() {
	const REPO = { owner: "w3c", repo: "csswg-drafts" };
	const HOT_THRESHOLD = parseInt(core.getInput("hot_threshold") || "15", 10);

	const themesPath = `${process.env.GITHUB_WORKSPACE}/${core.getInput("themes_path")}`;
	const THEME_RULES = yaml.load(fs.readFileSync(themesPath, "utf8"));

	const octokit = getOctokit(core.getInput("token"));

	function classify(issue) {
		const text = `${issue.title} ${(issue.labels ?? []).map((l) => l.name).join(" ")}`.toLowerCase();
		for (let i = 0; i < THEME_RULES.length; i++) {
			if (THEME_RULES[i].patterns.some((p) => text.includes(p))) return i;
		}
		return -1;
	}

	function makeBadges(issue, agendaNums) {
		const badges = [];
		let detail = null;
		if (agendaNums.has(issue.number)) badges.push("agenda");
		if ((issue.comments ?? 0) >= HOT_THRESHOLD) {
			badges.push("hot");
			detail = `${issue.comments} comments`;
		}
		const ageDays = (Date.now() - new Date(issue.created_at).getTime()) / 86_400_000;
		if (ageDays <= 3) badges.push("new");
		return { badges, badge_detail: detail };
	}

	core.info("Fetching recently updated issues...");
	const { data: issues } = await octokit.rest.issues.listForRepo({
		...REPO,
		state: "open",
		sort: "updated",
		direction: "desc",
		per_page: 40,
	});

	core.info("Fetching Agenda+ issues...");
	const { data: agendaIssues } = await octokit.rest.issues.listForRepo({
		...REPO,
		state: "open",
		labels: "Agenda+",
		sort: "updated",
		direction: "desc",
		per_page: 20,
	});
	const agendaNums = new Set(agendaIssues.map((i) => i.number));

	core.info("Fetching recently closed issues...");
	const { data: closedIssues } = await octokit.rest.issues.listForRepo({
		...REPO,
		state: "closed",
		sort: "updated",
		direction: "desc",
		per_page: 15,
	});

	const allIssues = issues.map((issue) => {
		const { badges, badge_detail } = makeBadges(issue, agendaNums);
		return {
			number: issue.number,
			title: issue.title,
			url: issue.html_url,
			comments: issue.comments ?? 0,
			updated_at: (issue.updated_at ?? "").slice(0, 10),
			labels: (issue.labels ?? []).map((l) => l.name),
			badges,
			badge_detail,
		};
	});

	const agendaList = agendaIssues.map((i) => ({
		number: i.number,
		title: i.title,
		url: i.html_url,
		comments: i.comments ?? 0,
	}));

	const resolvedList = closedIssues.slice(0, 10).map((i) => ({
		number: i.number,
		title: i.title,
		url: i.html_url,
		comments: i.comments ?? 0,
		closed_at: (i.closed_at ?? "").slice(0, 10),
		resolution_summary: i.title,
	}));

	const buckets = new Map(THEME_RULES.map((_, i) => [i, []]));
	for (const issueData of allIssues) {
		const raw = issues.find((i) => i.number === issueData.number);
		if (!raw) continue;
		const idx = classify(raw);
		if (idx >= 0) {
			buckets.get(idx).push({
				number: issueData.number,
				label: issueData.title
					.replace("[css-", "")
					.replace("[", "")
					.replace("]", " —")
					.trim()
					.slice(0, 60),
				badges: issueData.badges,
				badge_detail: issueData.badge_detail,
			});
		}
	}

	const themes = THEME_RULES.map((rule, idx) => {
		const items = buckets.get(idx) ?? [];
		if (!items.length) return null;
		return { title: rule.title, icon: rule.icon, summary: "", issues: items.slice(0, 5) };
	}).filter(Boolean);

	const names = themes.slice(0, 4).map((t) => t.title.toLowerCase());
	const big_themes =
		names.length > 1
			? `Active discussions this week span ${names.slice(0, -1).join(", ")}, & ${names.at(-1)}.`
			: `Activity this week is focused on ${names[0]}.`;

	const data = {
		meta: {
			generated_at: new Date().toISOString(),
			source: "github:w3c/csswg-drafts",
			generator_version: "2.0.0",
		},
		summary: {
			big_themes,
			watch_for: `${agendaList.length} issues are tagged Agenda+ for upcoming CSSWG discussion.`,
		},
		stats: {
			recently_active: allIssues.length,
			agenda_plus: agendaList.length,
			recently_resolved: resolvedList.length,
			hot_threads: allIssues.filter((i) => i.comments >= HOT_THRESHOLD).length,
		},
		themes,
		agenda: agendaList,
		resolved: resolvedList,
		issues: allIssues,
	};

	const outPath = `${process.env.RUNNER_TEMP}/csswg-activity.json`;
	fs.writeFileSync(outPath, JSON.stringify(data));
	core.setOutput("json_path", outPath);
	core.info(
		`Wrote ${allIssues.length} issues, ${agendaList.length} agenda+, ${resolvedList.length} resolved, ${themes.length} themes`,
	);
}

run().catch(core.setFailed);
