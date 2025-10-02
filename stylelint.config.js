export default {
	allowEmptyInput: true,
	cache: true,
	defaultSeverity: "warning",
	extends: ["stylelint-config-standard"],
	plugins: [
		"stylelint-order",
		"stylelint-use-logical",
		"stylelint-high-performance-animation",
	],
	rules: {
		/** --------------------------------------------------------------
		 * Disabled rules
		 * -------------------------------------------------------------- */
		"custom-property-empty-line-before": null,
		"declaration-block-no-redundant-longhand-properties": null,
		"declaration-empty-line-before": null,
		"import-notation": null,
		"no-descending-specificity": null,
		"no-duplicate-selectors": null,
		"number-max-precision": null,
		"custom-property-pattern": null,

		/** --------------------------------------------------------------
		 * Customized rule settings
		 * -------------------------------------------------------------- */
		/** @note use floats for opacity because it minifies better than percent */
		"alpha-value-notation": ["percentage", { exceptProperties: ["opacity"] }],
		"at-rule-empty-line-before": [
			"always",
			{
				except: ["blockless-after-blockless", "first-nested"],
				ignore: ["after-comment", "first-nested"],
				ignoreAtRules: ["extend"],
			},
		],
		"at-rule-no-unknown": [
			true,
			{
				ignoreAtRules: ["extend", "each", "include", "mixin"],
			},
		],
		"block-no-empty": [true, {
			ignore: ["comments"],
		}],
		"color-function-notation": ["modern", { ignore: ["with-var-inside"] }],
		"comment-empty-line-before": [
			"always",
			{
				except: ["first-nested"],
				ignore: ["after-comment", "stylelint-commands"],
				// don't require a newline before a passthrough flag
				ignoreComments: [
					/^\s*@deprecated?/,
					/^\s*@todo?/
				],
			},
		],
		"declaration-block-no-duplicate-custom-properties": true,
		"declaration-property-value-no-unknown": [
			true,
			{
				ignoreProperties: {
					"/.+/": ["CanvasText", "preserve-parent-color"],
				},
			},
		],
		"declaration-block-no-shorthand-property-overrides": true,
		"function-no-unknown": [
			true,
			{
				severity: "warning",
			},
		],
		"max-nesting-depth": [3, { severity: "warning" }],
		"property-no-unknown": [
			true,
			{
				checkPrefixed: true,
			},
		],
		"rule-empty-line-before": [
			"always",
			{
				except: ["first-nested"],
				ignore: ["after-comment"],
			},
		],
		"selector-attribute-quotes": "always",
		"selector-not-notation": "complex",
		"value-keyword-case": [
			"lower",
			{
				camelCaseSvgKeywords: true,
				ignoreKeywords: ["Transparent", "Text"],
			},
		],
		"value-no-vendor-prefix": [
			true,
			{
				disableFix: true,
				severity: "warning",
			},
		],

		/** --------------------------------------------------------------
		 * Plugins
		 * -------------------------------------------------------------- */
		"csstools/use-logical": true,
		"order/order": ["custom-properties", "declarations"],
		/** Performance */
		"plugin/no-low-performance-animation-properties": [
			true,
			{ severity: "warning" },
		],
	},
};
