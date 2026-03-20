import path from "node:path";
import { writeFile } from "node:fs/promises";

import postcss from "postcss";

/**
 * Process the provided CSS via PostCSS
 * @param {string} content
 * @param {import("node:fs").PathLike} inputPath
 * @param {import("node:fs").PathLike} outputPath
 * @param {import("postcss-load-config").Result}
 * @returns {string}
 */
export async function processCSS(content, inputPath, outputPath, config = {}) {
    console.log(inputPath);
    const parsed = path.parse(inputPath);

    return postcss(config.plugins ?? []).process(content, {
        ...config.options ?? {},
        from: inputPath,
        to: outputPath
    }).then(async result => {
        // Write the map file to the output directory
        if (result.map) {
            const outputFolder = path.join(path.dirname(outputPath), "css");
            console.log('Write to: ' + outputFolder + ' / ' + parsed.name);
            await writeFile(
                path.join(outputFolder, parsed.name + ".css.map"),
                result.map.toString()
            );
        }

        return result.css;
    });
};

export default {
    processCSS
};
