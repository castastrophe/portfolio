import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import yaml from "js-yaml";
import "colors";

const require = createRequire(import.meta.url);
const { SiteChecker } = require("broken-link-checker");

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");

const LOGGER = {
	success: (msg) => console.log(`\n${"✓".green}  ${msg}`),
	info: (msg) => console.log(`\n${"ℹ".blue}  ${msg}`),
	warn: (msg) => console.warn(`\n${"⚠".yellow}  ${msg}`),
	error: (msg) => console.error(`\n${"𝗑".red}  ${msg}`),
};

function loadConfig() {
	const configPath = resolve(root, ".checklinks.config.yaml");
	const { url, internal: internalConfig, ...options } = yaml.load(readFileSync(configPath, "utf8"));
	if (!url) {
		LOGGER.error(".checklinks.config.yaml must define a `url` to check.");
		process.exit(1);
	}
	return { url, internalConfig, options };
}

/** Parse TAP output from hyperlink and return an array of failure descriptions. */
function parseTapFailures(tap) {
	const failures = [];
	const lines = tap.split("\n");
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		if (line.startsWith("not ok")) {
			const description = line.replace(/^not ok \d+ - /, "");

			// Consume optional YAML block (  ---  ...  ...)
			let details = {};
			if (lines[i + 1]?.trimStart() === "---") {
				i += 2;
				const yamlLines = [];
				while (i < lines.length && lines[i]?.trimStart() !== "...") {
					yamlLines.push(lines[i]);
					i++;
				}
				try {
					details = yaml.load(yamlLines.join("\n")) ?? {};
				} catch {
					// ignore malformed YAML blocks
				}
			}

			failures.push({ description, ...details });
		}
		i++;
	}

	return failures;
}

function checkInternal(internalConfig) {
	return new Promise((done) => {
		if (!internalConfig) {
			done({ broken: [], skipped: true });
			return;
		}

		const { canonicalRoot, root: webRoot = "public", entry, skip = [], concurrency } = internalConfig;

		if (!existsSync(webRoot)) {
			done({ broken: [], error: `Build output not found at '${webRoot}'. Run 'yarn build' first.` });
			return;
		}

		const args = [];
		if (canonicalRoot) args.push("--canonicalroot", canonicalRoot);
		args.push("--root", webRoot, "-r", "-p", "-i");
		for (const pattern of skip) args.push("--skip", pattern);
		if (concurrency) args.push("--concurrency", String(concurrency));
		args.push(entry ?? `${webRoot}/index.html`);

		const bin = resolve(root, "node_modules/.bin/hyperlink");
		const child = spawn(bin, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });

		let stdout = "";
		child.stdout.on("data", (chunk) => { stdout += chunk; });
		child.on("error", (err) => done({ broken: [], error: err.message }));
		child.on("close", () => done({ broken: parseTapFailures(stdout) }));
	});
}

function checkExternal(url, options) {
	return new Promise((done) => {
		const broken = [];

		const checker = new SiteChecker(options, {
			link(result) {
				if (result.broken) {
					broken.push({
						status: result.http?.response?.status ?? result.brokenReason,
						url: result.url.resolved,
						page: result.base.resolved,
					});
				}
			},
			end() { done({ broken }); },
		});

		checker.enqueue(url);
	});
}

// Determine which checks to run based on CLI flags
const flags = process.argv.slice(2);
const runInternal = flags.length === 0 || flags.includes("--internal");
const runExternal = flags.length === 0 || flags.includes("--external");

const { url, internalConfig, options } = loadConfig();

LOGGER.info(`Checking links on ${url.underline} …`);

const [internalResult, externalResult] = await Promise.all([
	runInternal ? checkInternal(internalConfig) : { broken: [], skipped: true },
	runExternal ? checkExternal(url, options) : { broken: [], skipped: true },
]);

const divider = (label) => `\n${"─".repeat(3)} ${label} ${"─".repeat(Math.max(0, 60 - label.length))}`;

// Internal results
if (runInternal && !internalResult.skipped) {
	console.log(divider("Internal links").cyan);
	if (internalResult.error) {
		LOGGER.warn(internalResult.error);
	} else if (internalResult.broken.length === 0) {
		LOGGER.success("No broken internal links.");
	} else {
		for (const { description, message } of internalResult.broken) {
			LOGGER.error(`${description}${message ? `\n         ${message}` : ""}`);
		}
	}
}

// External results
if (runExternal && !externalResult.skipped) {
	console.log(divider("External links").cyan);
	if (externalResult.broken.length === 0) {
		LOGGER.success("No broken external links.");
	} else {
		for (const { status, url: href, page } of externalResult.broken) {
			LOGGER.error(`BROKEN [${status.toString().yellow}] ${href.underline}\n         on page: ${page.underline}`);
		}
	}
}

// Summary
const brokenInternal = internalResult.broken?.length ?? 0;
const brokenExternal = externalResult.broken?.length ?? 0;
const totalBroken = brokenInternal + brokenExternal;
const hasErrors = totalBroken > 0 || !!internalResult.error;

console.log("\n" + "─".repeat(65));
if (hasErrors) {
	const parts = [];
	if (brokenInternal) parts.push(`${brokenInternal} internal`);
	if (brokenExternal) parts.push(`${brokenExternal} external`);
	LOGGER.error(`${parts.join(", ")} broken link(s) found.`);
	process.exit(1);
} else {
	LOGGER.success("All links OK.");
}
