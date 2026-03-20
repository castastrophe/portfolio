const dateIsPresent = (date) => date === "present" || date === null || !date;

/**
 * Sort roles by start-date descending (most recent first)
 **/
const sortByDate = ([a, b], key = 'date') => {
    const dateA = a[key];
    const dateB = b[key];
    if (dateIsPresent(dateA)) return -1;
    if (dateIsPresent(dateB)) return 1;
    return dateB.localeCompare(dateA);
};

/**
 * Convert a string date to an ISO string for use in HTML metadata
 * @param {string} date - The date to convert
 * @returns {string} The ISO string
 */
export const toISOString = (date) => date ? new Date(date).toISOString() : '';

/**
 * Filter to format a date for use in blog posts
 * @param {string} string - The date to format
 * @param {Intl.DateTimeFormatOptions} [options]
 * @param {Intl.LocalesArgument} [lang='en-GB']
 * @returns {string} The formatted date
 */
export const customDateFormat = (string, options = {}, lang = 'en-US') => {
    if (!string) return string;

    const date = new Date(string);
    if (date === "Invalid Date" || isNaN(date)) return string;

    return date.toLocaleDateString(lang, options);
};

/**
 * Convert a string date to a year for use in HTML metadata
 * @param {string} date - The date to convert
 * @returns {string} The year
 */
export const yearFormat = (date) => date ? new Date(date).getFullYear() : '';

/**
 * Filter to get featured items from a collection
 * @param {object[]} value - The collection to filter
 * @returns {object[]} The featured items
 */
export const featured = (value) => {
    return value?.filter(item => {
        if (item.data?.featured) return true;
        if (item.data?.tags?.includes('featured')) return true;
        if (item.featured) return true;
        return false;
    });
};


/**
 * Group experience entries by company for timeline display
 * @param {object[]} experience - An array of experience objects
 * @returns {object[]}
 **/
export const groupByCompany = function(experience) {
    if (!experience?.length) return [];

    const groups = new Map();

    for (const job of experience) {
        const key = job.company;
        if (!groups.has(key)) {
            groups.set(key, {
                company: key,
                category: job.category,
                featured: false,
                roles: []
            });
        }

        const group = groups.get(key);
        group.roles.push(job);
        if (job.featured) group.featured = true;
    }

    for (const group of groups.values()) {
        // Sort roles by end-date descending (most recent first)
        group.roles.sort((a, b) => sortByDate([a, b], 'end-date'));

        // Compute company-wide date range
        let earliest = null;
        let latest = null;

        for (const role of group.roles) {
            const start = role["start-date"];
            const end = role["end-date"];

            if (start && !dateIsPresent(start)) {
                if (!earliest || start < earliest) earliest = start;
            }

            if (!end || dateIsPresent(end)) {
                latest = "present";
            } else if (!latest || end > latest) {
                latest = end;
            }
        }

        group["start-date"] = earliest;
        group["end-date"] = latest;
    }

    return [...groups.values()];
};

/**
 * Splits out the first word of a string
 * @param {string} string
 * @returns {string}
 */
export const firstWord = (string) => String(string)?.trim()?.split(' ')?.[0];

/**
 * Splits out the last word of a string
 * @param {string} string
 * @returns {string}
 */
export const lastWord = (string) => {
    const words = string?.trim()?.split(' ');
    return words?.[words.length - 1];
};

/**
 * Removes all whitespace in a string
 * @param {string} string
 * @returns {string}
 */
export const stripWhitespace = (string) => string?.replace(/\s/g, '');

/**
 * Removes all whitespace in a string
 * @param {string} string
 * @returns {string}
 */
export const trimWhitespace = (string) => string?.trim();

/**
 * Filter to get only digits from a string
 * @param {string} string - The string to filter
 * @returns {string} The string with only digits
 */
export const digitsOnly = (string) => string?.replace(/\D/g, '')?.trim();

export default {
    toISOString,
    customDateFormat,
    yearFormat,
    featured,
    groupByCompany,
    firstWord,
    lastWord,
    stripWhitespace,
    trimWhitespace,
    digitsOnly
};
