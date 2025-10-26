/** @type {import('postcss-load-config').ConfigFn} */
export default ({ env }) => ({
    map: env === "production" ? false : true,
    plugins: {
        /* --------------------------------------------------- */
        /* ------------------- IMPORTS ---------------- */
        /** @link https://github.com/postcss/postcss-import#postcss-import */
        'postcss-import': {},
        /* --------------------------------------------------- */
        /* ------------------- UTILITIES ---------------- */
        'postcss-extend': {},
        'postcss-each': {},
        /* --------------------------------------------------- */
        /* ------------------- POLYFILLS --------------------- */
        /**
         * @todo should we be documenting this for downstream users rather
         * than polyfilling the features ourselves? what if they want to
         * use a different support matrix?
         *
         * @note stage 2 (default); stage 4 === stable
         * @link https://github.com/csstools/postcss-plugins
         * @link https://preset-env.cssdb.org/features/#stage-2
         */
        'postcss-preset-env': {
            stage: 3,
        },
        /* --------------------------------------------------- */
        /* ------------------- LINTING ---------------- */
        // Linter needs to run before the minifier removes comments (such as the stylelint-ignore comments)
        stylelint: {
            cache: true,
            // Passing the config path saves a little time b/c it doesn't have to find it
            configFile: "stylelint.config.js",
            fix: true,
            allowEmptyInput: true,
            ignorePath: ".stylelintignore",
            reportNeedlessDisables: true,
            reportInvalidScopeDisables: true,
        },
        autoprefixer: {},
        cssnano: env === "production" ? { preset: "default" } : false,
        /* --------------------------------------------------- */
        /* ------------------- REPORTING --------------------- */
        "postcss-reporter": {
            clearAllMessages: true,
            noIcon: true,
        },
    },
});
