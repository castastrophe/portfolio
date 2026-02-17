/**
 * Formatter helpers for resume content replacement.
 * Used by the layout (window.formatter) and by tests.
 */
export default {
	/**
	 * Get the first part of the text.
	 * @param {string} text - The text to process.
	 * @param {string} separator - The separator to use.
	 * @returns {string} The first part of the text.
	 */
	first(text, separator = ' ') {
		if (!text) return '';
		// Split the text on the separator and return the first part
		return text?.split(separator)?.[0];
	},
	/**
	 * Get the last part of the text.
	 * @param {string} text - The text to process.
	 * @param {string} separator - The separator to use.
	 * @returns {string} The last part of the text.
	 */
	last(text, separator = ' ') {
		if (!text) return '';
		const parts = text?.split(separator);
		// Return the last part of the text
		return parts[parts.length - 1];
	},
	/**
	 * Clean the text by removing all whitespace and replacing double newlines with paragraphs.
	 * @param {string} text - The text to clean.
	 * @returns {string} The cleaned text.
	 */
	clean(text) {
		const output = text?.trim();
		// Double newlines equate to paragraphs while single newlines equate to spaces
		const paragraphs = output?.split(/\n\n/g) ?? [output];
		return paragraphs?.map((p) => `<p>${p.replace(/\n/g, ' ')}</p>`).join('');
	},
	/**
	 * Remove all whitespace from the value.
	 * @param {string} value - The value to process.
	 * @returns {string} The processed value.
	 */
	raw(value) {
		// Return the value as a string and trim whitespace
		return String(value ?? '').trim();
	},
	/**
	 * Remove all whitespace from the value.
	 * @param {string} value - The value to process.
	 * @returns {string} The processed value.
	 */
	noSpace(value) {
		if (!value) return '';
		// Remove all whitespace
		return String(value ?? '').replace(/\s/g, '').trim();
	},
	/**
	 * Replace the -at- text with an @ symbol; this prevents spam bots.
	 * @param {string} value - The email address to process.
	 * @returns {string} The processed email address.
	 */
	toEmail(value) {
		if (!value) return '';
		// Remove all whitespace and replace -at- with @
		return value.replace(/-at-/g, '@').replace(/\s/g, '').trim();
	},
	/**
	 * Convert a digits-only phone number to a human-readable string.
	 * @param {string|number} value - The phone number to process.
	 * @returns {string} The formatted phone number.
	 */
	toPhone(value) {
		if (!value) return '';
		
		// If the phone number starts with +1, remove the +1
		if (String(value ?? '').startsWith('+1')) {
			value = String(value ?? '').slice(2);
		}

		// Convert the phone number to a string and remove all non-digit characters
		const digits = String(value ?? '').replace(/\D/g, '');

		// Format the phone number as (XXX) XXX-XXXX for US numbers
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	},
	/**
	 * Format a date string using the Intl.DateTimeFormat API.
	 * @param {string} value - The date to format.
	 * @param {Intl.DateTimeFormatOptions} format - The format to use (optional)
	 * @returns {string} The formatted date.
	 */
	date(value, format={ lang: 'en-US', year: 'numeric', month: 'long' }) {
		if (!value) return '';
		
		const str = String(value)?.trim();

		format = { lang: 'en-US', year: 'numeric', month: 'long', ...format };

		if (str?.toLowerCase() === 'present') return str;

		// Convert the date string to a Date object
		return new Intl.DateTimeFormat(format.lang, format).format(
			new Date(str),
		);
	},
	/**
	 * Format a date string using the Intl.DateTimeFormat API.
	 * @param {string} value - The date to format.
	 * @param {Intl.DateTimeFormatOptions} format - The format to use (optional)
	 * @returns {string} The formatted date.
	 */
	year(value, format={ lang: 'en-US', year: 'numeric' }) {
		if (!value) return '';
		
		const str = String(value)?.trim();

		format = { lang: 'en-US', year: 'numeric', ...format };

		if (str?.toLowerCase() === 'present') return str;

		// Convert the date string to a Date object
		return new Intl.DateTimeFormat(format.lang, format).format(
			new Date(str),
		);
	},
	/**
	 * Convert a date string to an ISO string.
	 * @param {string} date - The date to convert.
	 * @returns {string} The ISO string.
	 */
	toISOString(date) {
		if (!date) return '';
		// Convert the date string to an ISO string
		return new Date(date).toISOString();
	},
	/**
	 * Remove all non-digit characters from the value.
	 * @param {string} value - The value to process.
	 * @returns {string} The processed value.
	 */
	digitsOnly(value) {
		if (!value) return '';
		// Remove all non-digit characters
		return String(value ?? '').replace(/\D/g, '');
	},
};
