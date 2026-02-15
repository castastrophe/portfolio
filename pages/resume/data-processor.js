export default class DataProcessor {
	/**
	 * Returns the handler method for the given value type (simple, array, or object).
	 * @param {string|number|boolean|object} value
	 * @returns {(context: Element, key: string, value: unknown, shouldKeep?: boolean) => void|Element | undefined}
	 */
	processorType(value) {
		switch (typeof value) {
			case 'string':
			case 'number':
			case 'boolean':
				return this.simple.bind(this);
			case 'object':
				if (Array.isArray(value)) {
					return this.array.bind(this);
				}
				return this.object.bind(this);
		}
	}

    /**
     * Returns the local formatter function for the given element
     * @param {Element} el
     * @returns {Function}
     */
    getFormatter(el) {
        // Look for a data-type attribute and use the corresponding formatter function
        const type = el?.dataset?.type;
    
        if (
            type &&
            typeof window.formatter?.[type] === 'function'
        ) {
            return window.formatter[type];
        }
    
        return window.formatter.clean ?? (text => text);
    }

	// If the value is a simple string, number, or boolean, we can just replace the appropriate field in the document
	simple(context, key, value, shouldKeep = true) {
		// context may be the element to update (e.g. when object() passes a single span); querySelector only finds descendants
		let element = context.querySelector?.(`[data-replace-key="${key}"]`);
		if (!element && context.getAttribute?.('data-replace-key') === key) element = context;

		// Not all content will be relevant to this rendered page so we can move on if it's not there
		if (!element) return;

		// If the value is a true/false, that indiciates if the entry should be removed or not
		if (typeof value === 'boolean') {
			if (Boolean(value) === false) element.remove();
			return;
		}

		// Update the element
		element.innerHTML = this.getFormatter(element)?.call(this, value) ?? value;
		return element;
	}

	// If the value is an array, we need to iterate over the array and replace the appropriate fields in the document
	array(context, key, value, shouldKeep = true) {
		if (value.length === 0) return;

		// This array should have 1 container element that contains the items to be rendered
		// note that we don't know yet what type the values are, but we're focusing on the container
		const containers = context.querySelectorAll(`[data-replace-key="${key}"]`);

		// With no container, there's no way to process these items
		if (!containers.length) return;

		for (const container of containers) {
			const target = container.querySelector(`[data-template]`) ?? container.querySelector(`[data-target]`) ?? container;

			// Create a template from the container
			const template = document.createElement('template');
			template.innerHTML = target.innerHTML;

			const fragment = document.createDocumentFragment();

			// If the value is an array, we need to iterate over the array and replace the appropriate fields in the document
			for (const item of value) {
				let row = document.importNode(target, true);

				// Determine what type of content is in the array item now
				const handler = this.processorType(item);
				if (typeof handler !== 'function') continue;

				// If the row is a template, we need to find the target within it
				if (row?.dataset?.template) {
					row = row.querySelector(`[data-target]`) ?? row;
				}

				handler(row, key, item, false);
				if (row) fragment.appendChild(row);
			}

			container.innerHTML = '';
			container.appendChild(fragment.cloneNode(true));
		}
	}

	// If the value is an object, we need to replace the keys as relevant
	object(context, key, value, shouldKeep = true) {
		if (Object.keys(value).length === 0) return;

		// This object should have 1 container element that contains the items to be rendered
		// note that we don't know yet what type the values are, but we're focusing on the container
		let containers = context.querySelectorAll(`[data-replace-key="${key}"]`);

		if (!containers.length) return;

		for (const container of containers) {
			// Create a template from the container
			const template = document.createElement('template');
			template.innerHTML = container.innerHTML;

			const fragment = document.createDocumentFragment();

			for (const [subKey, subValue] of Object.entries(value)) {
				const item = template.content.querySelector(`[data-replace-key="${subKey}"]`);

				// With no item, there's no way to process these items
				if (!item) continue;

				// Determine what type of content is in the array item now
				const handler = this.processorType(subValue);
				if (typeof handler !== 'function') continue;

				handler(item, subKey, subValue, false);
				if (item) fragment.appendChild(item.cloneNode(true));
			}

			container.innerHTML = '';
			container.appendChild(fragment.cloneNode(true));
		}
	}
}