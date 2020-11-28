/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ArgumentException from 'Logic/Exception/ArgumentException';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import EnumerationException from 'Logic/Exception/Value/EnumerationException';
import ImportException from 'Logic/Exception/Interfacer/ImportException';
import ExportException from 'Logic/Exception/Interfacer/ExportException';

const merge = 1;
const overwrite = 2;
const allowedMergeType = [
	merge,
	overwrite
];
Object.freeze(allowedMergeType);

/**
 * @abstract
 */
class Interfacer {

	/**
	 * @type {string} preference name that define private context
	 *     private properties are interfaced only in private context
	 */
	static get PRIVATE_CONTEXT() {return 'privateContext';}

	/**
	 * @type {string} preference name that define if only updated value will be exported
	 */
	static get ONLY_UPDATED_VALUES() {return 'updatedValueOnly';}

	/**
	 * @type {string} preference name that define filter for exported properties
	 */
	static get PROPERTIES_FILTER() {return 'propertiesFilter';}

	/**
	 * @type {string} preference name that define if complexes values have to be flatten
	 */
	static get FLATTEN_VALUES() {return 'flattenValues';}

	/**
	 * @type {string} preference name that define if simple values are string
	 *     available only during import for scalar interfacers
	 */
	static get STRINGIFIED_VALUES() {return 'stringifiedValues';}

	/**
	 * @type {string} preference name that define if imported values have to be flagged has updated
	 */
	static get FLAG_VALUES_AS_UPDATED() {return 'flagValuesAsUpdated';}

	/**
	 * @type {string} preference name that define if object created during import have to be flagged as loaded
	 */
	static get FLAG_OBJECT_AS_LOADED() {return 'flagObjectAsLoaded';}

	/**
	 * @type {string} preference name that define if interfacer must verify if foreign values are referenced
	 * (i.e. if there is an existing value not foreign with same id) in interfaced object.
	 */
	static get VERIFY_REFERENCES() {return 'verifyReferences';}

	/**
	 * @type {string} preference name that define if interfacer must validate root object to interface
	 *
	 * validation concern required properties, conflicts, dependencies and array size.
	 */
	static get VALIDATE() {return 'validate';}

	/**
	 * @type {string} preference name that define merge type during import
	 */
	static get MERGE_TYPE() {return 'mergeType';}

	/** @type {integer} */
	static get MERGE() {return merge;}

	/** @type {integer} */
	static get OVERWRITE() {return overwrite;}

	/** @type {string} */
	static get INHERITANCE_KEY() {return 'inheritance-';}

	/** @type {string} */
	static get ASSOCIATIVE_KEY() {return 'key-';}

	/** @type {string} */
	static get COMPLEX_ID_KEY() {return 'id';}

	/** @type {string[]} */
	static get ALLOWED_MERGE_TYPE() {return allowedMergeType;}

	/** @type {boolean} */
	#privateContext = false;

	/** @type {boolean} */
	#updatedValueOnly = false;

	/** @type {string[]} */
	#propertiesFilter = [];

	/** @type {boolean} */
	#flattenValues = false;

	/** @type {boolean} */
	#stringifiedValues = false;

	/** @type {integer} */
	#mergeType = Interfacer.MERGE;

	/** @type {boolean} */
	#flagValuesAsUpdated = true;

	/** @type {boolean} */
	#flagObjectAsLoaded = true;

	/** @type {boolean} */
	#verifyReferences = true;

	/** @type {boolean} */
	#validate = true;

	constructor() {
		if (this.constructor === Interfacer) {
			throw new Error('can\'t instanciate abstract class Interfacer');
		}
	}

	/**
	 * verify if private properties have to be interfaced
	 *
	 * @returns {boolean}
	 */
	isPrivateContext() {
		return this.#privateContext;
	}

	/**
	 * define if private properties have to be interfaced
	 *
	 * @param {boolean} boolean
	 */
	setPrivateContext(boolean) {
		this.#privateContext = boolean;
	}

	/**
	 * verify if has to export only updated values
	 *
	 * @returns {boolean}
	 */
	hasToExportOnlyUpdatedValues() {
		return this.#updatedValueOnly;
	}

	/**
	 * define if has to export only updated values
	 *
	 * @param {boolean} boolean
	 */
	setExportOnlyUpdatedValues(boolean) {
		this.#updatedValueOnly = boolean;
	}

	/**
	 * verify if has properties filter
	 *
	 * @returns {boolean} boolean
	 */
	hasPropertiesFilter() {
		return this.#propertiesFilter.length > 0;
	}

	/**
	 * get properties filter
	 *
	 * @returns {array|void} return null if there is no filter
	 */
	getPropertiesFilter() {
		return this.hasPropertiesFilter()
			? this.#propertiesFilter
			: null;
	}

	/**
	 * reset properties filter
	 */
	resetPropertiesFilter() {
		this.#propertiesFilter = [];
	}

	/**
	 * set properties filter for specified model
	 *
	 * @param {string[]} propertiesNames
	 */
	setPropertiesFilter(propertiesNames) {
		this.#propertiesFilter = propertiesNames;
	}

	/**
	 * define if complex values have to be flatten
	 *
	 * @param {boolean} boolean
	 */
	setFlattenValues(boolean) {
		this.#flattenValues = boolean;
	}

	/**
	 * verify if complex values have to be flatten
	 *
	 * @returns {boolean}
	 */
	hasToFlattenValues() {
		return this.#flattenValues;
	}

	/**
	 * define if interfaced simple values are stringified and must be casted during import
	 *
	 * @param {boolean} boolean
	 */
	setStringifiedValues(boolean) {
		this.#stringifiedValues = boolean;
	}

	/**
	 * verify if interfaced simple values are stringified and must be casted during import
	 */
	isStringifiedValues() {
		return this.#stringifiedValues;
	}

	/**
	 * define if imported values have to be flagged has updated
	 *
	 * @param {boolean} boolean
	 */
	setFlagValuesAsUpdated(boolean) {
		this.#flagValuesAsUpdated = boolean;
	}

	/**
	 * verify if imported values have to be flagged has updated
	 *
	 * @returns {boolean}
	 */
	hasToFlagValuesAsUpdated() {
		return this.#flagValuesAsUpdated;
	}

	/**
	 * define if object created during import have to be flagged as loaded
	 *
	 * @param {boolean} boolean
	 */
	setFlagObjectAsLoaded(boolean) {
		this.#flagObjectAsLoaded = boolean;
	}

	/**
	 * verify if object created during import have to be flagged as loaded
	 *
	 * @returns {boolean}
	 */
	hasToFlagObjectAsLoaded() {
		return this.#flagObjectAsLoaded;
	}

	/**
	 * define if interfacing must verify if foreign values are referenced
	 * (i.e. if there is an existing value not foreign with same id) in interfaced object.
	 * if true given, when interfacing foreign value without reference, an exception is thrown.
	 * values with main model are not concerned.
	 *
	 * @param {boolean} boolean
	 */
	setVerifyReferences(boolean) {
		this.#verifyReferences = boolean;
	}

	/**
	 * verify if interfacing must verify if foreign values are referenced
	 * (i.e. if there is an existing value not foreign with same id) in interfaced object.
	 *
	 * @returns {boolean}
	 */
	hasToVerifyReferences() {
		return this.#verifyReferences;
	}

	/**
	 * define if interfacing must validate root object to interface.
	 * if true given, when interfacing object not valid, an exception is thrown.
	 *
	 * validation concern required properties, conflicts, dependencies and array size.
	 *
	 * @param {boolean} boolean
	 */
	setValidate(boolean) {
		this.#validate = boolean;
	}

	/**
	 * verify if interfacing must validate root object to interface.
	 *
	 * validation concern required properties, conflicts, dependencies and array size.
	 *
	 * @returns {boolean}
	 */
	mustValidate() {
		return this.#validate;
	}

	/**
	 * define merge type to apply during import
	 *
	 * @param {integer} mergeType possible values are [Interfacer.MERGE, Interfacer.OVERWRITE]
	 */
	setMergeType(mergeType) {
		if (!Interfacer.ALLOWED_MERGE_TYPE.indexOf(mergeType) === -1) {
			throw new ArgumentException(mergeType, Interfacer.ALLOWED_MERGE_TYPE, 1);
		}
		this.#mergeType = mergeType;
	}

	/**
	 * get merge type to apply during import
	 *
	 * @returns {integer}
	 */
	getMergeType() {
		return this.#mergeType;
	}

	/**
	 * get media type associated to exported format
	 *
	 * @abstract
	 * @returns {string}
	 */
	getMediaType() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get value in node with property name
	 *
	 * @abstract
	 * @param {*} node
	 * @param {string} name
	 * @param {boolean} asNode
	 * @returns {*} null if doesn't exist
	 */
	getValue(node, name, asNode = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if node contain value with property name
	 *
	 * @abstract
	 * @param {*} node
	 * @param {string} name
	 * @param {boolean} asNode
	 * @returns {boolean}
	 */
	hasValue(node, name, asNode = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is null
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNullValue(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is expected node type
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNodeValue(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is an array node
	 *
	 * @abstract
	 * @param {*} value
	 * @param {boolean} isAssociative
	 * @returns {boolean}
	 */
	isArrayNodeValue(value, isAssociative) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is a complex id (with inheritance key) or a simple value
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	isComplexInterfacedId(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is a flatten complex id (with inheritance key)
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	isFlattenComplexInterfacedId(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * set value in node with property name
	 *
	 * @abstract
	 * @param {*} node
	 * @param {*} value
	 * @param {string} name
	 * @param {boolean} asNode
	 */
	setValue(node, value, name = null, asNode = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * unset value in node with property name
	 *
	 * @abstract
	 * @param {*} node
	 * @param {string} name
	 * @param {boolean} asNode
	 */
	unsetValue(node, name, asNode = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * add value to node
	 *
	 * @abstract
	 * @param {*} node
	 * @param {*} value
	 * @param {string} name
	 */
	addValue(node, value, name = null) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * add value to node
	 *
	 * @abstract
	 * @param {*} node
	 * @param {*} value
	 * @param {string} key
	 * @param {string} name
	 */
	addAssociativeValue(node, value, key, name = null) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * create node
	 *
	 * @abstract
	 * @param {string} name
	 * @returns {*}
	 */
	createNode(name = null) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get node classes
	 *
	 * @abstract
	 * @returns {string[]}
	 */
	getNodeClasses() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * create array node
	 *
	 * @abstract
	 * @param {string} name
	 * @returns {*}
	 */
	createArrayNode(name = null) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get array node classes
	 *
	 * @abstract
	 * @returns {string[]}
	 */
	getArrayNodeClasses() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * transform given node to string
	 *
	 * @abstract
	 * @param {*} node
	 * @param {boolean} prettyPrint
	 * @returns {string}
	 */
	toString(node, prettyPrint = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * transform given string to node
	 *
	 * @abstract
	 * @param {*} string
	 * @returns {*}
	 */
	fromString(string) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * flatten value (transform object/array to string)
	 *
	 * @abstract
	 * @param {*} node
	 * @param {string} name
	 */
	flattenNode(node, name) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * unflatten value (transform string to object/array)
	 *
	 * @abstract
	 * @param {array} node
	 * @param {string} name
	 */
	unFlattenNode(node, name) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * replace value in property name by value (fail if property name doesn't exist)
	 *
	 * @abstract
	 * @param {*} node
	 * @param {string} name
	 * @param {*} value value to place in key name
	 */
	replaceValue(node, name, value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if interfaced object has typed scalar values (int, float, string...).
	 *
	 * @returns {boolean}
	 */
	hasScalarTypedValues() {
		return true;
	}

	/**
	 * export given comhon object to interfaced object
	 *
	 * @param {AbstractComhonObject} object
	 * @param {array} preferences
	 * @returns {*}
	 */
	export(object, preferences = {}) {
		this.setPreferences(preferences);
		try {
			return object.export(this);
		} catch (e) {
			throw new ExportException(e);
		}
	}

	/**
	 * import given node and construct comhon object
	 *
	 * @async
	 * @param {*} node
	 * @param {Model|ModelArray} model
	 * @param {array} preferences
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async import(node, model, preferences = {}) {
		this.setPreferences(preferences);
		try {
			return model.import(node, this);
		} catch (e) {
			throw new ImportException(e);
		}
	}

	/**
	 *
	 * @param {*} node
	 */
	setPreferences(preferences) {
		if (typeof preferences !== 'object') {
			throw new Error('preferences must be null or an object');
		}
		// private
		if (Interfacer.PRIVATE_CONTEXT in preferences) {
			if (typeof preferences[Interfacer.PRIVATE_CONTEXT] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.PRIVATE_CONTEXT], 'boolean', Interfacer.PRIVATE_CONTEXT);
			}
			this.setPrivateContext(preferences[Interfacer.PRIVATE_CONTEXT]);
		}

		// only updated values
		if (Interfacer.ONLY_UPDATED_VALUES in preferences) {
			if (typeof preferences[Interfacer.ONLY_UPDATED_VALUES] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.ONLY_UPDATED_VALUES], 'boolean', Interfacer.ONLY_UPDATED_VALUES);
			}
			this.setExportOnlyUpdatedValues(preferences[Interfacer.ONLY_UPDATED_VALUES]);
		}

		// preoperties filter
		if (Interfacer.PROPERTIES_FILTER in preferences) {
			if (!Array.isArray(preferences[Interfacer.PROPERTIES_FILTER])) {
				throw new UnexpectedValueTypeException(preferences[Interfacer.PROPERTIES_FILTER], 'array', Interfacer.PROPERTIES_FILTER);
			}
			this.setPropertiesFilter(Interfacer.PROPERTIES_FILTER);
		}

		// flatten values
		if (Interfacer.FLATTEN_VALUES in preferences) {
			if (typeof preferences[Interfacer.FLATTEN_VALUES] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.FLATTEN_VALUES], 'boolean', Interfacer.FLATTEN_VALUES);
			}
			this.setFlattenValues(preferences[Interfacer.FLATTEN_VALUES]);
		}

		// stringified values
		if (Interfacer.STRINGIFIED_VALUES in preferences) {
			if (typeof preferences[Interfacer.STRINGIFIED_VALUES] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.STRINGIFIED_VALUES], 'boolean', Interfacer.FLATTEN_VALUES);
			}
			this.setFlattenValues(preferences[Interfacer.STRINGIFIED_VALUES]);
		}

		// flag values as updated
		if (Interfacer.FLAG_VALUES_AS_UPDATED in preferences) {
			if (typeof preferences[Interfacer.FLAG_VALUES_AS_UPDATED] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.FLAG_VALUES_AS_UPDATED], 'boolean', Interfacer.FLAG_VALUES_AS_UPDATED);
			}
			this.setFlagValuesAsUpdated(preferences[Interfacer.FLAG_VALUES_AS_UPDATED]);
		}

		// flag ComhonObject as updated
		if (Interfacer.FLAG_OBJECT_AS_LOADED in preferences) {
			if (typeof preferences[Interfacer.FLAG_OBJECT_AS_LOADED] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.FLAG_OBJECT_AS_LOADED], 'boolean', Interfacer.FLAG_OBJECT_AS_LOADED);
			}
			this.setFlagObjectAsLoaded(preferences[Interfacer.FLAG_OBJECT_AS_LOADED]);
		}

		// verify foreign values references
		if (Interfacer.VERIFY_REFERENCES in preferences) {
			if (typeof preferences[Interfacer.VERIFY_REFERENCES] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.VERIFY_REFERENCES], 'boolean', Interfacer.VERIFY_REFERENCES);
			}
			this.setVerifyReferences(preferences[Interfacer.VERIFY_REFERENCES]);
		}

		// validate root object
		if (Interfacer.VALIDATE in preferences) {
			if (typeof preferences[Interfacer.VALIDATE] !== 'boolean') {
				throw new UnexpectedValueTypeException(preferences[Interfacer.VALIDATE], 'boolean', Interfacer.VALIDATE);
			}
			this.setValidate(preferences[Interfacer.VALIDATE]);
		}

		// merge type
		if (Interfacer.MERGE_TYPE in preferences) {
			if (Interfacer.ALLOWED_MERGE_TYPE.indexOf(preferences[Interfacer.MERGE_TYPE]) === -1) {
				throw new EnumerationException(preferences[Interfacer.MERGE_TYPE], Interfacer.ALLOWED_MERGE_TYPE, Interfacer.MERGE_TYPE);
			}
			this.setMergeType(preferences[Interfacer.MERGE_TYPE]);
		}
	}

}

export default Interfacer;
