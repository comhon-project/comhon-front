/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Interfacer from 'Logic/Interfacer/Interfacer';
import ArgumentException from 'Logic/Exception/ArgumentException';
import ComhonException from 'Logic/Exception/ComhonException';

/**
 * media type indexed by format name
 *
 * @var {Object} ALLOWED_FORMATS
 */
const ALLOWED_FORMATS = {
	//yaml: 'application/x-yaml', TODO add yaml management
	json: 'application/json'
};
Object.freeze(ALLOWED_FORMATS);

/**
 * media type indexed by format name
 *
 * @var {Object} ALLOWED_MEDIA_TYPES
 */
const ALLOWED_MEDIA_TYPES = {
	//'application/x-yaml': 'yaml', TODO add yaml management
	'application/json': 'json'
};
Object.freeze(ALLOWED_MEDIA_TYPES);

class ObjectInterfacer extends Interfacer {

	/** @type {string} */
	#format;

	/**
	 *
	 * @param {string} format format to use when load value from string (or file)
	 *                       and when transform object to string (or when save it into a file).
	 *                       format must belong to ALLOWED_FORMATS. it may be either a format or media type.
	 */
	constructor(format = 'json') {
		super();
		if (format in ALLOWED_FORMATS) {
			this.#format = format;
		} else if (format in ALLOWED_MEDIA_TYPES) {
			this.#format = ALLOWED_MEDIA_TYPES[format];
			if (!(this.#format in ALLOWED_FORMATS)) {
				throw new Error('ALLOWED_FORMATS and ALLOWED_MEDIA_TYPES are not synchronized');
			}
		} else {
			const enumeration = ['json', 'application/json'/*, 'yaml', 'application/x-yaml'*/];
			throw new ArgumentException(format, 'string', 1, enumeration);
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Interfacer}::getMediaType()
	 */
	getMediaType() {
		return ALLOWED_FORMATS[this.#format];
	}

	/**
	 * get value in node with property name
	 *
	 * @param {Object} node
	 * @param {string} name
	 * @param {boolean} asNode not used (but needed to stay compatible with interface)
	 * @returns {*} null if doesn't exist
	 */
	getValue(node, name, asNode = false) {
		if (name in node) {
			return node[name];
		}
		return null;
	}

	/**
	 * verify if node contain value with property name
	 *
	 * @param {Object} node
	 * @param {string} name
	 * @param {boolean} asNode not used (but needed to stay compatible with interface)
	 * @returns {boolean}
	 */
	hasValue(node, name, asNode = false) {
		return (name in node);
	}

	/**
	 * verify if value is null
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNullValue(value) {
		return value === null;
	}

	/**
	 * verify if value is an object
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNodeValue(value) {
		return (value !== null && typeof value === 'object');
	}

	/**
	 * verify if value is an array
	 *
	 * @param {*} value
	 * @param {boolean} isAssociative
	 * @returns {boolean}
	 */
	isArrayNodeValue(value, isAssociative) {
		return (!isAssociative && Array.isArray(value)) || (isAssociative && value !== null && typeof value === 'object');
	}

	/**
	 * verify if value is a complex id (with inheritance key) or a simple value
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isComplexInterfacedId(value) {
		return value !== null && typeof value === 'object';
	}

	/**
	 * verify if value is a flatten complex id (with inheritance key)
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isFlattenComplexInterfacedId(value) {
		return (typeof value === 'string') && value.substr(0, 6) === '{"id":';
	}

	/**
	 * set value in node with property name
	 *
	 * @param {Object} node
	 * @param {*} value
	 * @param {string} name must be specified and not null (there is a default value to stay compatible with interface)
	 * @param {boolean} asNode not used (but needed to stay compatible with interface)
	 */
	setValue(node, value, name = null, asNode = false) {
		if (node === null || typeof node !== 'object') {
			throw new ArgumentException(node, 'Object', 1);
		}
		if (name === null) {
			throw new ArgumentException(name, 'string', 3);
		}
		node[name] = value;
	}

	/**
	 * unset value in node with property name
	 *
	 * @param {Object} node
	 * @param {string} name
	 * @param {boolean} asNode not used (but needed to stay compatible with interface)
	 */
	unsetValue(node, name, asNode = false) {
		delete node[name];
	}

	/**
	 * add value to node
	 *
	 * @param {array} node
	 * @param {*} value
	 * @param {string} name not used (but needed to stay compatible with interface)
	 */
	addValue(node, value, name = null) {
		if (!Array.isArray(node)) {
			throw new ArgumentException(node, 'array', 1);
		}
		node.push(value);
	}

	/**
	 * add value to node
	 *
	 * @param {array} node
	 * @param {*} value
	 * @param {string} key
	 * @param {string} name not used (there is a default value to stay compatible with interface)
	 */
	addAssociativeValue(node, value, key, name = null) {
		if (node === null || typeof node !== 'object') {
			throw new ArgumentException(node, 'object', 1);
		}
		if (key === null) {
			throw new ArgumentException(key, 'string', 3);
		}
		node[key] = value;
	}

	/**
	 * create object node
	 *
	 * @param {string} name not used (but needed to stay compatible with interface)
	 * @returns {Object}
	 */
	createNode(name = null) {
		return {};
	}

	/**
	 * {@inheritDoc}
	 * @see {Interfacer}::getNodeClasses()
	 */
	getNodeClasses() {
		return ['object'];
	}

	/**
	 * create array node
	 *
	 * @param {string} name not used (but needed to stay compatible with interface)
	 * @param {boolean} isAssociative determine if array is associative (if true, an object is created)
	 * @returns {array}
	 */
	createArrayNode(name = null, isAssociative = false) {
		return isAssociative ? {} : [];
	}

	/**
	 * {@inheritDoc}
	 * @see {Interfacer}::getArrayNodeClasses()
	 */
	getArrayNodeClasses() {
		return ['array'];
	}

	/**
	 * transform given node to string
	 *
	 * @param {Object} node
	 * @param {boolean} prettyPrint
	 * @returns {string}
	 */
	toString(node, prettyPrint = false) {
		switch (this.#format) {
			case 'json':
				return prettyPrint ? JSON.stringify(node, null, 2) : JSON.stringify(node);
			// TODO case 'yaml':
				// TODO return Yaml::dump(node, 1000, 4, Yaml::DUMP_OBJECT_AS_MAP | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE);
			default:
				throw new ComhonException('undefined format ' + this.#format);
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Interfacer}::fromString()
	 */
	fromString(string) {
		switch (this.#format) {
			case 'json':
				return JSON.parse(string);
			// TODO case 'yaml':
				// TODO return Yaml::parse(string, Yaml::PARSE_OBJECT_FOR_MAP);
			default:
				throw new ComhonException('undefined format ' + this.#format);
		}
	}

	/**
	 * flatten value (transform object/array to string)
	 *
	 * @param {Object} node
	 * @param {string} name
	 */
	flattenNode(node, name) {
		if (name in node) {
			node[name] = JSON.stringify(node[name]);
		}
	}

	/**
	 * unflatten value (transform string to object/array)
	 *
	 * @param {array} node
	 * @param {string} name
	 */
	unFlattenNode(node, name) {
		if (node !== null && (typeof node[name] === 'string')) {
			node[name] = JSON.parse(node[name]);
		}
	}

	/**
	 * replace value in property name by value (fail if property name doesn't exist)
	 *
	 * @param {Object} node
	 * @param {string} name
	 * @param {*} value
	 */
	replaceValue(node, name, value) {
		if (name in node) {
			this.setValue(node, value, name);
		}
	}

}

export default ObjectInterfacer;
