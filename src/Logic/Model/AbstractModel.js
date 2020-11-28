/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @abstract
 */
class AbstractModel {

	constructor() {
		if (this.constructor === AbstractModel) {
			throw new Error('can\'t instanciate abstract class AbstractModel');
		}
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
	 * verify if model is loaded or not
	 *
	 * @returns {boolean}
	 */
	isLoaded() {
		return true;
	}

	/**
	 * verify if model is abstract.
	 * object with abstract model may be instanciated but cannot be set as loaded and cannot be interfaced
	 *
	 * @returns {boolean}
	 */
	isAbstract() {
		return false;
	}

	/**
	 * load model
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async load() {
		// do nothing
	}

	/**
	 * get model name
	 *
	 * @returns {void}
	 */
	getName() {
		return null;
	}

	/**
	 * verify if model is complex or not
	 *
	 * model is complex if model is not instance of SimpleModel
	 *
	 * @returns {boolean}
	 */
	isComplex() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if during import we stay in first level object or not
	 *
	 * @abstract
	 * @param {boolean} isCurrentLevelFirstLevel
	 * @returns {boolean}
	 */
	_isNextLevelFirstLevel(isCurrentLevelFirstLevel) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * export value in specified format according interfacer
	 *
	 * @abstract
	 * @param {*} value
	 * @param {string} nodeName
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @param {Element[]} nullNodes nodes that need to be processed at the end of export (only used for xml export).
	 * @param {Object} oids oid (object id) map of all exported objects (to avoid infinit loop)
	 * @param {boolean} isolate
	 * @throws {ComhonException}
	 * @returns {*}
	 */
	_export(value, nodeName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * import interfaced object
	 *
	 * @async
	 * @abstract
	 * @param {*} interfacedValue
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @param {boolean} isolate
	 * @returns {Promise<*>}
	 */
	async _import(interfacedValue, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if value is correct according current model
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if specified model is equal (same instance) to this model
	 *
	 * @param AbstractModel model
	 * @returns {boolean}
	 */
	isEqual(model) {
		return this === model;
	}

}

export default AbstractModel;
