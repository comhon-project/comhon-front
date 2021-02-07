/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MainObjectCollection from 'Logic/Object/Collection/MainObjectCollection';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import Model from 'Logic/Model/Model';
import ComhonException from 'Logic/Exception/ComhonException';
import ImportException from 'Logic/Exception/Interfacer/ImportException';
import ExportException from 'Logic/Exception/Interfacer/ExportException';
import AbstractObjectException from 'Logic/Exception/Object/AbstractObjectException';

/**
 * @abstract
 */
class AbstractComhonObject {

	/**
	 * @type  {Model|ModelArray}
	 * model associated to comhon object
	 */
	static #nextOid = 0;

	/**
	 * @type  {Model|ModelArray}
	 * model associated to comhon object
	 */
	#model;

	/**
	 * @type {Object|Array.} all object values
	 */
	#values = new Map();

	/**
	 * @type {boolean} determine if comhon object is loaded
	 */
	#isLoaded = false;

	/**
	 * @type {boolean[]} references all updated values
	 *     element value is false if set or replaced value
	 *     element value is true if deleted value
	 */
	#updatedValues = new Map();

	/**
	 * @type {boolean} determine if object is flagged as updated
	 *     warning! if false, that not necessarily means object is not updated
	 *     actually a sub-object contained in current object may be updated
	 */
	#isUpdated = false;

	/**
	 * @type {integer} unique object id (oid) permit to identify an instance of comhon object or comhon array.
	 */
	#oid;

	/**
	 * @param {Model|ModelArray} model
	 */
	constructor(model) {
		if (this.constructor === AbstractComhonObject) {
			throw new Error('can\'t instanciate abstract class AbstractComhonObject');
		} else if (this.getClassName() === 'ComhonArray' && !model.isAssociative()) {
			this.#values = [];
		}
		this.#model = model;
		this.#oid = AbstractComhonObject.#nextOid;
		AbstractComhonObject.#nextOid++;
	}

	/**
	 * get class name
	 *
	 * @abstract
	 */
	getClassName() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get object id (oid).
	 *
	 * oid permit to identify an instance of comhon object or comhon array.
	 * oid is not a part of comhon object values, it is not the id describe in model properties.
	 * (very usefull when visit comhon object to avoid infinite loop (may happened when an object contain itslef)).
	 *
	 * @returns {integer}
	 */
	getOid() {
		return this.#oid;
	}

	/***********************************************************************************************\
	|                                                                                               |
	|                                        Values Setters                                         |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 * set specified value
	 *
	 * @param {string} name
	 * @param {*} value
	 * @param {boolean} flagAsUpdated if true, flag value as updated
	 */
	setValue(name, value, flagAsUpdated = true) {
		if (this._hasToUpdateMainObjectCollection(name)) {
			if (this.hasCompleteId() && MainObjectCollection.getObject(this.getId(), this.#model) === this) {
				MainObjectCollection.removeObject(this, false);
			}
			if (Array.isArray(this.#values)) {
				// if array, name is actually an index
				if (name > this.#values.length) {
					throw new ComhonException(name+' is out of range, it cannot be set');
				}
				this.#values[name] = value;
			} else {
				this.#values.set(name, value);
			}
			MainObjectCollection.addObject(this, false);
		} else {
			if (Array.isArray(this.#values)) {
				// if array, name is actually an index
				if (name > this.#values.length) {
					throw new ComhonException(name+' is out of range, it cannot be set');
				}
				this.#values[name] = value;
			} else {
				this.#values.set(name, value);
			}
		}
		if (flagAsUpdated) {
			this.#updatedValues.set(name, null);
			this.#isUpdated = true;
		}
	}

	/**
	 * add value at the end of values
	 *
	 * @param {*} value
	 * @param {boolean} flagAsUpdated
	 */
	_pushValue(value, flagAsUpdated) {
		if (!Array.isArray(this.#values)) {
			throw new ComhonException('pushValue is callable only from ComhonArray with a NOT associative model array');
		}
		this.#values.push(value);
		if (flagAsUpdated) {
			this.#isUpdated = true;
		}
	}

	/**
	 * remove last value from values
	 *
	 * @param {boolean} flagAsUpdated
	 * @returns {*} the last value of array. If array is empty,null will be returned.
	 */
	_popValue(flagAsUpdated) {
		if (!Array.isArray(this.#values)) {
			throw new ComhonException('popValue is callable only from ComhonArray with a NOT associative model array');
		}
		if (flagAsUpdated) {
			this.#isUpdated = true;
		}
		return this.#values.pop();
	}

	/**
	 * add value at the beginning of values
	 *
	 * @param {*} value
	 * @param {boolean} flagAsUpdated
	 */
	_unshiftValue(value, flagAsUpdated) {
		if (!Array.isArray(this.#values)) {
			throw new ComhonException('unshiftValue is callable only from ComhonArray with a NOT associative model array');
		}
		this.#values.unshift(value);
		if (flagAsUpdated) {
			this.#isUpdated = true;
		}
	}

	/**
	 * remove first value from values
	 *
	 * @param {boolean} flagAsUpdated
	 * @returns {*} the first value of array. If array is empty,null will be returned.
	 */
	_shiftValue(flagAsUpdated) {
		if (!Array.isArray(this.#values)) {
			throw new ComhonException('shiftValue is callable only from ComhonArray with a NOT associative model array');
		}
		if (flagAsUpdated) {
			this.#isUpdated = true;
		}
		return this.#values.shift();
	}

	/**
	 * unset specified value
	 *
	 * @param {string} name
	 * @param {boolean} flagAsUpdated
	 */
	unsetValue(name, flagAsUpdated = true) {
		if (this.hasValue(name)) {
			if (this._hasToUpdateMainObjectCollection(name)) {
				MainObjectCollection.removeObject(this);
			}
			if (Array.isArray(this.#values)) {
			this.#values.splice(name, 1)
			} else {
				this.#values.delete(name);
			}
			if (flagAsUpdated) {
				this.#isUpdated = true;
				this.#updatedValues.set(name, null);
			}
		}
	}

	/**
	 * instanciate a AbstractComhonObject and add it to values
	 *
	 * @async
	 * @abstract
	 * @param {string} name may be a property name (if current object is a ComhonObject) or a key (if current object is a ComhonArray)
	 * @param {boolean} isLoaded if true, flag value as loaded
	 * @param {boolean} flagAsUpdated if true, flag value as updated
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async initValue(name, isLoaded = true, flagAsUpdated = true) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * reset values, reset update status and unload object
	 *
	 * @abstract
	 */
	reset() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * reset values, reset update status and unload object
	 */
	_reset() {
		if (Array.isArray(this.#values)) {
			this.#values = [];
		} else {
			this.#values = new Map();
		}
		this.#isUpdated = false;
		this.#updatedValues = new Map();
		this.#isLoaded = false;
	}

	/***********************************************************************************************\
	|                                                                                               |
	|                                        Values Getters                                         |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 *
	 * @param {string} name
	 * @returns {ComhonArray|ComhonObject|*} null if value doesn't exist in values
	 */
	getValue(name) {
		return this.hasValue(name)
			? (Array.isArray(this.#values) ? this.#values[name] : this.#values.get(name))
			: null;
	}

	/**
	 * get associative array that reference names of values that are flagged as updated
	 *
	 * @returns {Map} each key is a property name of a value that is flagged as updated
	 */
	getUpdatedValues() {
		return this.#updatedValues;
	}

	/**
	 * verify if comhon object has specified value set.
	 * if value is set and null, return true.
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasValue(name) {
		return Array.isArray(this.#values) ? (name in this.#values) : this.#values.has(name);
	}

	/**
	 * verify if comhon object has specified value set and not null.
	 * if value is set and null, return false.
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	issetValue(name) {
		return Array.isArray(this.#values)
			? (name in this.#values && this.#values[name] !== null)
			: (this.#values.has(name)  && this.#values.get(name) !== null);
	}

	/**
	 * verify if comhon object has all specified values set
	 *
	 * @param {string[]} names
	 * @returns {boolean}
	 */
	hasValues(names) {
		for (const name of names) {
			if (!this.hasValue(name)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * get values count
	 *
	 * @returns number
	 */
	count() {
		return Array.isArray(this.#values) ? this.#values.length : this.#values.size;
	}

	/**
	 * get object values and array values that contain objects
	 *
	 * @returns {Array.AbstractComhonObject}
	 */
	getObjectValues() {
		const values = new Map();
		for (const [key, value] of this) {
			if (value instanceof AbstractComhonObject && value.getUniqueModel() instanceof Model) {
				values.set(key, value);
			}
		}
		return values;
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                       Iterator functions                                      |
		|                                                                                               |
		\***********************************************************************************************/

	[Symbol.iterator]() {
		if (Array.isArray(this.#values)) {
			let index = -1;
			return {
				next: () => {
					index++;
					return {value: [index, this.#values[index]], done: !(index in this.#values)};
				}
			};
		} else {
			return this.#values[Symbol.iterator]();
		}
	};

	/***********************************************************************************************\
	|                                                                                               |
	|                                      ComhonObject Status                                      |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 * verify if comhon object is flagged as updated or if at least one value has been updated
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isUpdated() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if at least one id value has been updated
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isIdUpdated() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if a value has been updated
	 *
	 * @abstract
	 * @param {string} name
	 * @returns {boolean}
	 */
	isUpdatedValue(name) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if object is flagged as updated
	 *
	 * do not use this function to known if object is updated (use this.#isUpdated)
	 *
	 * @returns {boolean}
	 */
	isFlaggedAsUpdated() {
		return this.#isUpdated;
	}

	/**
	 * verify if a value is flagged as updated
	 *
	 * do not use this function to known if a value is updated (use this.#isUpdatedValue)
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	isValueFlaggedAsUpdated(name) {
		return this.#updatedValues.has(name);
	}

	/**
	 * reset updated status
	 *
	 * @abstract
	 * @param {boolean} recursive if true visit children comhon objects and reset their updated status
	 */
	resetUpdatedStatus(recursive = true) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * reset updated status of comhon objects recursively
	 *
	 * @abstract
	 * @param {Object} oids
	 */
	_resetUpdatedStatusRecursive(oids) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * reset updated Status (reset only this.#isUpdated and this.#updatedValues)
	 */
	_resetUpdatedStatus() {
		this.#isUpdated = false;
		this.#updatedValues = new Map();
	}

	/**
	 * flag value as updated, only if value is set
	 *
	 * @param {string} name
	 * @returns {boolean} true if success
	 */
	flagValueAsUpdated(name) {
		if (this.hasValue(name)) {
			this.#isUpdated = true;
			this.#updatedValues.set(name, null);
			return true;
		}
		return false;
	}

	/**
	 * flag value according given updated status
	 *
	 * @param {string} name
	 * @param {boolean} isUpdated
	 */
	forceValueStatus(name, isUpdated) {
		if (isUpdated) {
			this.#isUpdated = true;
			this.#updatedValues.set(name, null);
		} else {
			this.#updatedValues.delete(name);
			if (this.#updatedValues.size === 0) {
				this.#isUpdated = false;
			}
		}
	}

	/**
	 * verify if comhon object is loaded
	 *
	 * @returns {boolean}
	 */
	isLoaded() {
		return this.#isLoaded;
	}

	/**
	 * set loaded status
	 *
	 * @param {boolean} isLoaded
	 */
	setIsLoaded(isLoaded) {
		if (isLoaded && !this.#isLoaded) {
			if (this.#model.isAbstract()) {
				throw new AbstractObjectException(this);
			}
		}
		this.#isLoaded = isLoaded;
	}

	/**
	 * validate object.
	 * throw exception if object is not valid.
	 *
	 * @abstract
	 */
	validate() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if object is valid.
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isValid() {
		throw new Error('function must be overridden in children class');
	}

	/***********************************************************************************************\
	|                                                                                               |
	|                                      Model - Properties                                       |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 * do not use this function, it's only used for cast
	 *
	 * @param {Model|ModelArray} model
	 */
	_updateModel(model) {
		this.#model = model;
	}

	/**
	 * get model associated to comhon object
	 *
	 * @returns {Model|ModelArray}
	 */
	getModel() {
		return this.#model;
	}

	/**
	 * verify if main object collection has to be updated if value is updated
	 *
	 * @abstract
	 * @param {string} propertyName
	 * @returns {boolean}
	 */
	_hasToUpdateMainObjectCollection(propertyName) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get unique contained model
	 *
	 * @returns {Model|SimpleModel}
	 */
	getUniqueModel() {
		return this.getModel();
	}

	/**
	 * get current comhon object class and its model name
	 *
	 * @abstract
	 * @returns {string}
	 */
	getComhonClass() {
		throw new Error('function must be overridden in children class');
	}

	/***********************************************************************************************\
	|                                                                                               |
	|                                Serialization / Deserialization                                |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 * load specified value
	 *
	 * value must be set and must be a comhon object with serialization
	 *
	 * @abstract
	 * @param {string} name
	 * @param {string[]} propertiesFilter
	 * @param {boolean} forceLoad if object is already loaded, force to reload object
	 * @returns {boolean} true if loading is successfull (loading can fail if object is not serialized)
	 */
	loadValue(name, propertiesFilter = null, forceLoad = false) {
		throw new Error('function must be overridden in children class');
	}

	/***********************************************************************************************\
	|                                                                                               |
	|                                       export / import                                         |
	|                                                                                               |
	\***********************************************************************************************/

	/**
	 * export comhon object according specified interfacer
	 *
	 * @async
	 * @param {Interfacer} interfacer
	 * @returns {ComhonObject|ComhonArray}
	 */
	async export(interfacer) {
		try {
			return await this.#model.export(this, interfacer);
		} catch (e) {
			throw new ExportException(e);
		}
	}

	/**
	 * fill comhon object with values of interfaced object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {boolean} forceIsolateElements if object to fill is a comhon array,
	 *     force isolate each elements of imported array
	 *     (isolated element doesn't share objects instances with others elements)
	 * @returns {Promise<void>}
	 */
	async fill(interfacedObject, interfacer, forceIsolateElements = true) {
		try {
			return this.#model.fillObject(this, interfacedObject, interfacer, forceIsolateElements);
		} catch (e) {
			throw new ImportException(e);
		}
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                           toString                                            |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 * stringify object
	 *
	 * @async
	 * @returns {string}
	 */
	async stringify() {
		try {
			const interfacer = new ObjectInterfacer();
			interfacer.setPrivateContext(true);
			interfacer.setVerifyReferences(false);
			interfacer.setValidate(false);
			return JSON.stringify(await interfacer.export(this), null, 2) + "\n";
		} catch (e) {
			console.log('object can\'t be stringified because it is invalid : ' + e.getMessage());
		}
		return '';
	}

}

export default AbstractComhonObject;
