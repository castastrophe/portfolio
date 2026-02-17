/**
 * @typedef {Object} DataProcessorConfig
 * @property {boolean} verbose - Whether to log verbose output to the console.
 */

/**
 * @typedef {Function} ProcessFunction
 * @param {string} key - The key of the value to replace.
 * @param {unknown} value - The value to replace.
 * @param {Element} [context=this.context] - The context element to replace the value in.
 * @param {boolean} [shouldKeep=this.#config.forceKeep] - Whether to keep the existing content if the value is empty.
 * @returns {Promise<void>}
 */

/** @type {DataProcessorConfig} */
const DEFAULT_CONFIG = {
	verbose: false,
	forceKeep: true,
};

/** @type {string} CLASS_NAME - The name of the class */
const CLASS_NAME = 'DataProcessor';

/**
 * The DataProcessor class is responsible for processing the data and replacing the appropriate fields in the document.
 * @class DataProcessor
 * @param {Object} data - The data to process
 * @param {Element} context - The context element to replace the value in.
 * @param {DataProcessorConfig} config - The configuration for the DataProcessor
 * @returns {void}
 */
export default class DataProcessor {
	/**
	 * The configuration for the DataProcessor
	 * @type {DataProcessorConfig}
	 */
	#config;

	/**
	 * The messages to log
	 * @type {Array<{message: string, location: string}>}
	 */
	#messages = [];

	get logs() {
		const logs = this.#messages.filter(item => item.type === 'log');
		return logs.length ? logs.map(item => `[${CLASS_NAME}${item.location ? `:${item.location}` : ''}] ${item.message.join(' ')}`).join('\n') : undefined;
	}

	get warnings() {
		const warnings = this.#messages.filter(item => item.type === 'warn');
		return warnings.length ? warnings.map(item => `[${CLASS_NAME}${item.location ? `:${item.location}` : ''}] ${item.message.join(' ')}`).join('\n') : undefined;
	}

	get errors() {
		const errors = this.#messages.filter(item => item.type === 'error');
		return errors.length ? errors.map(item => `[${CLASS_NAME}${item.location ? `:${item.location}` : ''}] ${item.message.join(' ')}`).join('\n') : undefined;
	}

	/**
	 * The logger for the DataProcessor
	 * @type {Function}
	 */
	#log = (message, location) => {
		if (this.#config.verbose) {
			console.info(`[${CLASS_NAME}${location ? `:${location}` : ''}]`, ...message);
		}

		this.#messages.push({ message, location, type: 'log' });
	};

	#warn = (message, location) => {
		if (this.#config.verbose) {
			console.warn(`[${CLASS_NAME}${location ? `:${location}` : ''}]`, ...message);
		}

		this.#messages.push({ message, location, type: 'warn' });
	};

	#error = (message, location) => {
		console.error(`[${CLASS_NAME}${location ? `:${location}` : ''}]`, ...message);
		this.#messages.push({ message, location, type: 'error' });
	};

	/**
	 * Constructor for the DataProcessor
	 * @param {Object} data - The data to process
	 * @param {Element} [context] - The context element to replace the value in.
	 * @param {DataProcessorConfig} [config] - The configuration for the DataProcessor
	 * @returns {void}
	 */
	constructor(data, config = {}) {
		const function_name = 'constructor';
		
		// Merge the configuration with the default configuration
		this.#config = { ...DEFAULT_CONFIG, ...config };

		// If a specific context is not provided, we fallback to the default context instead
		this.context = config.context ?? document.body;

		let error_thrown = false;

		// Data is required to instantiate the DataProcessor, throw an error if it's not provided
		if (data == null || typeof data === 'undefined') {
			this.#error('A data object must be provided in order to instantiate the processor', function_name);
			error_thrown = true;
		}

		// Check the format of the data; it should be an object or a string of an object
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (error) {
				this.#error('The data provided is not a valid object', function_name);
				error_thrown = true;
			}
		}

		// If the data is not an object, throw an error
		if (typeof data !== 'object' || data === null) {
			this.#error('The data provided is not a valid object', function_name);
			error_thrown = true;
		}

		// Store the data and context for later use
		this.data = data ?? {};

		// Bind the methods to the instance
		this.init = this.init.bind(this);

		this.simple = this.simple.bind(this);
		this.array = this.array.bind(this);
		this.object = this.object.bind(this);

		// Getters used by the processor functions
		this.getProcessor = this.getProcessor.bind(this);
		this.getTemplate = this.getTemplate.bind(this);
		this.getFormatter = this.getFormatter.bind(this);
		this.getElements = this.getElements.bind(this);

		// Initialize the DataProcessor
		if (!error_thrown) this.init();
	}

	/**
	 * Initialize the DataProcessor with the given data and context
	 * @returns {Promise<void>}
	 */
	async init() {
		const function_name = 'init';

		return this.object(undefined, this.data).then(() => {
			this.#log([`Initialization complete`], function_name);
		}).catch((error) => {
			this.#error([`Error during initialization:`, error], function_name);
		});
	}

	/**
	 * Returns the handler method for the given value type (simple, array, or object).
	 * @param {string|number|boolean|object} value
	 * @returns {ProcessFunction} The function to process the value.
	 */
	getProcessor(value) {
		const function_name = 'getProcessor';

		let processor;

		switch (typeof value) {
			case 'string':
			case 'number':
			case 'boolean':
				this.#log([`Value is a ${typeof value} (${value}), returning simple processor`], function_name);
				// If the value is a simple string, number, or boolean, we can just replace the appropriate field in the document.
				processor = this.simple;
				break;
			case 'object':
				// If the value is an array, we need to iterate over the array and replace the appropriate fields in the document
				if (Array.isArray(value)) {	
					this.#log([`Value is an array (${value.length} items), returning array processor`], function_name);
					processor = this.array;
				} else {
					// If the value is an object, we need to replace the keys as relevant
					this.#log([`Value is an object, returning object processor`], function_name);
					processor = this.object;
				}
				break;
			default:
				this.#warn([`Unknown or unhandled value type: ${typeof value}`, value], function_name);
				processor = this.simple;
				break;
		}

		return processor;
	}

	/**
	 * Fetch the appropriate template for the given id
	 * @param {Element} [context=this.context] - The context element to fetch the template from.
	 * @returns {Element|undefined} The template element.
	 */
	getTemplate(context = this.context) {
		const function_name = 'getTemplate';

		this.#log([`Fetching template if available`], function_name);

		const id = context.dataset?.template;

		if (!id) return;

		let clone;

		// Fetch the template element by id
		const template = document.querySelector(`#${id}`);

		if (!template) {
			this.#warn([`Template not found for id:`, id], function_name);
		} else if (template.content) {
			this.#log([`Template found for id:`, id, template.content], function_name);

			// If a template is found, we clone it to create a new element to update
			clone = document.importNode(template.content, true);
		}

		return clone;
	}

    /**
     * Returns the local formatter function for the given element
     * @param {Element} el
     * @returns {Function}
     */
    getFormatter(el) {
		const function_name = 'getFormatter';

		let formatter;

        // Look for a data-type attribute and use the corresponding formatter function
        const type = el?.dataset?.type;
    
		if (type && typeof window.formatter?.[type] === 'function') {
			this.#log([`Formatter found for type:`, type], function_name);
			formatter = window.formatter[type];
		}

		if (type && !formatter) {
			this.#warn([`No formatter found for type:`, type], function_name);
		}

		if (!formatter) {
			if (window.formatter?.raw) {
				this.#log([`Using default formatter: raw`], function_name);
				formatter = window.formatter.raw;
			} else {
				formatter = (text => text);
			}
		}

		return formatter;

	}

	/**
	 * Fetch the elements for the given key
	 * @param {string} key
	 * @param {Element} [context=this.context]
	 * @returns {Array<Element>}
	 */
	getElements(key, context = this.context) {
		const function_name = 'getElements';

		const elements = [];
		if (!key || context.dataset?.replaceKey === key) {
			// If the context matches the key, we add it to the elements array
			elements.push(context);
		}

		else if (context.querySelector?.(`[data-replace-key="${key}"]`)) {
			// Collect all elements: descendants with data-replace-key, and context itself if it matches
			elements.push(...context.querySelectorAll(`[data-replace-key="${key}"]`));
		}

		if (key && elements.length > 0) this.#log([`Found ${elements.length} elements for key: ${key}`], function_name);

		// Fallback to the context if no elements are found
		if (elements.length === 0) elements.push(context);

		return elements;
	}

	/**If the value is a simple string, number, or boolean, we can just replace the appropriate field in the document.
	 * All elements with the same data-replace-key are updated (querySelectorAll-style).
	 * @type {ProcessFunction} simple
	 */
	async simple(key, value, context = this.context, shouldKeep = this.#config.forceKeep) {
		const function_name = 'simple';

		this.#log([`Processing: `, value], function_name);

		if (!context) context = this.context;

		/** @type {'keep' | 'remove' | 'update'} */
		let action = 'update';

		// New content not available: keep existing (default) or remove per shouldKeep
		if (value == null || value === '') {
			action = shouldKeep ? 'keep' : 'remove';
			this.#log([`No value provided, ${action} existing content`], function_name);
		}

		// If the value is a true/false, that indicates if the entry should be removed or not
		else if (typeof value === 'boolean') {
			action = Boolean(value) ? 'keep' : 'remove';
			this.#log([`Value is ${Boolean(value) ? 'true' : 'false'}, ${action} existing content`], function_name);
		}

		const containers = this.getElements(key, context);

		// Update every matching element (each may have its own formatter via data-type)
		return Promise.all(containers.map(async (container) => {
			const formatter = this.getFormatter(container);

			if (action === 'remove') {
				container.innerHTML = '';
			}

			if (value && action === 'update') {
				container.innerHTML = formatter(value) ?? value;
			}

			this.#log([`${action} element with formatted content`, container?.outerHTML], function_name);

			return Promise.resolve(container);
		})).then(() => {
			return Promise.resolve(context);
		});
	}

	/**
	 * If the value is an array, we need to iterate over the array and replace the appropriate fields in the document
	 * @note Currently, arrays are the only type that supports a custom template tag with which to iterate over the items.
	 * @type {ProcessFunction} array
	 */
	async array(key, value, context = this.context, shouldKeep = this.#config.forceKeep) {
		const function_name = 'array';

		this.#log([`Processing: `, value], function_name);

		/** @type {'keep' | 'remove' | 'update'} */
		let action = 'update';

		if (value.length === 0) {
			// New content not available (empty array): keep existing or clear per shouldKeep
			action = shouldKeep ? 'keep' : 'remove';
			this.#log([`Array is empty, ${action} existing content`], function_name);
		}

		// This array should have 1 container element that contains the items to be rendered
		const containers = this.getElements(key, context);

		return Promise.all(containers.map(async (container, index) => {
			this.#log([`Processing container ${index + 1} of ${containers.length}:`, container], function_name);

			const items = [];

			// @note Templates are only used for arrays of content, not objects
			let template = this.getTemplate(container);

			// Process the item with the appropriate handler
			if (!template) {
				// If no template is found, we clone the first child of the container 🤞
				if (container.firstElementChild) {
					template = document.importNode(container.firstElementChild, true);
				} else {
					this.#warn([`Nothing to clone for container:`, container], function_name);

					return Promise.resolve(container);
				}
			}

			// We iterate over the value array and process each item with the appropriate handler
			await Promise.all(value.map(async (data, index) => {
				this.#log([`Processing data:`, data, `(index: ${index} of ${value.length})`], function_name);

				// Determine what type of content is in the array item now
				const handler = this.getProcessor(data);
				if (typeof handler !== 'function') return Promise.resolve(container);

				const localClone = document.importNode(template, true);
				return handler(key, data, localClone, false).then((updatedElement) => {
					if (updatedElement) items.push(updatedElement);
				});
			}));

			// If the action is not to keep the existing content, we clear the container to make way for the new content
			if (action !== 'keep' && items.length > 0) {
				container.innerHTML = '';
			}

			if (items.length) items.forEach(item => container.appendChild(item));
			return Promise.resolve(container);
		})).then(() => Promise.resolve(context));
	}

	/**
	 * If the value is an object, we need to replace the keys as relevant
	 * @type {ProcessFunction} object
	 * @note For objects, we don't really need the original key value,
	 * 	rather we're going to be searching for the nested keys within the object
	 */
	async object(sourceKey, sourceObj, context = this.context, shouldKeep = this.#config.forceKeep) {
		const function_name = 'object';

		this.#log([`Processing: `, sourceObj], function_name);

		/** @type {'keep' | 'remove' | 'update'} */
		let action = 'update';

		// New content not available (empty object): keep existing or clear per shouldKeep
		if (Object.keys(sourceObj).length === 0) {
			action = shouldKeep ? 'keep' : 'remove';
			this.#log([`Object is empty, ${action} existing content`], function_name);
		}

		const containers = this.getElements(sourceKey, context);

		return Promise.all(containers.map(async (container) => {
			const entries = Object.entries(sourceObj);
			return Promise.all([...entries].map(async ([key, value]) => {
				// Determine what type of content is in the object at this key now
				const handler = this.getProcessor(value);
				if (typeof handler !== 'function') return Promise.resolve(container);
				
				// Get all elements with the data-replace-key for this key
				const items = this.getElements(key, container);

				// Process each item with the identified handler
				return Promise.all(
					items.map(async (item) => handler(key, value, item, false))
				).then(() => Promise.resolve(container));
			})).then(() => {
				this.#log([`All object keys processed and updated in the container`], function_name);
				return Promise.resolve(container);
			});
		})).then(() => Promise.resolve(context));
	}
};