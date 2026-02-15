/**
 * Formatter helpers for resume content replacement.
 * Used by the layout (window.formatter) and by tests.
 */
export default {
	clean(text) {
		const output = text?.trim();
		// Double newlines equate to paragraphs while single newlines equate to spaces
		const paragraphs = output?.split(/\n\n/g) ?? [output];
		return paragraphs?.map((p) => `<p>${p.replace(/\n/g, ' ')}</p>`).join('');
	},
	date(value) {
		const lang = document.documentElement?.lang ?? 'en-US';
		if (!value) return '';
		const str = String(value);
		if (str.toLowerCase() === 'present') return 'Present';
		return new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long' }).format(
			new Date(value),
		);
	},
	raw(value) {
		return String(value ?? '').trim();
	},
};
