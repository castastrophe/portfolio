export default {
	"*.css": [
		"stylelint --fix --cache --allow-empty-input --report-descriptionless-disables --report-invalid-scope-disables --report-needless-disables",
		"prettier --no-config --no-error-on-unmatched-pattern --ignore-unknown --log-level silent --write --config .prettierrc",
	],
	"*.{js,json}": [
		"eslint --fix --cache --no-error-on-unmatched-pattern --quiet"
	],
	"*.{md,mdx}": [
		"prettier --no-error-on-unmatched-pattern --ignore-unknown --log-level silent --write --config .prettierrc"
	]
};
