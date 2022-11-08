module.exports = {
    syntax: "postcss-scss",
    parser: 'postcss-scss',
    map: true,
    plugins: {
        "postcss-preset-env": {},
        "@csstools/postcss-sass": {
            "style": process.env.NODE_ENV === "production" ? "compressed" : "expanded"
        }
    }
};
