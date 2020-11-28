/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractModel from 'Logic/Model/AbstractModel';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import CastStringException from 'Logic/Exception/Model/CastStringException';

/**
 * @abstract
 */
class SimpleModel extends AbstractModel {

	/** @type {string} */
	#modelName;

	/**
	 * don't instanciate a model by yourself because it take time
	 * to get a model instance use singleton ModelManager
	 */
	constructor(modelName) {
		super();
		if (this.constructor === SimpleModel) {
			throw new Error('can\'t instanciate abstract class SimpleModel');
		}
		this.#modelName = modelName;
	}

	/**
	 * get class name
	 *
	 * @returns {string}
	 */
	getClassName() {
		return this.#modelName;
	}

	/**
	 * get model name
	 *
	 * @returns {string}
	 */
	getName() {
		return this.#modelName;
	}

	/**
	 * get short name of model (name without namespace)
	 *
	 * @returns {string}
	 */
	getShortName() {
		return this.#modelName;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::isComplex()
	 */
	isComplex() {
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_isNextLevelFirstLevel()
	 */
	_isNextLevelFirstLevel(isCurrentLevelFirstLevel) {
		return isCurrentLevelFirstLevel;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_export()
	 */
	_export(value, nodeName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate = false) {
		return this.exportSimple(value, interfacer);
	}

	/**
	 * export value in specified format
	 *
	 * @param {*} value
	 * @param {Interfacer} interfacer
	 * @returns {*}
	 */
	exportSimple(value, interfacer) {
		return value;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_import()
	 */
	async _import(value, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		return this.importValue(value, interfacer);
	}

	/**
	 * import interfaced value
	 *
	 * @param {*} value
	 * @param {Interfacer} interfacer
	 * @param {boolean} applyCast if true and if interfacer setting Interfacer.STRINGIFIED_VALUES is set to true, value will be casted during import
	 * @returns {*}
	 */
	importValue(value, interfacer) {
		if (interfacer.isNullValue(value)) {
			return null;
		}
		if (interfacer instanceof XMLInterfacer && value instanceof Element) {
			value = interfacer.extractNodeText(value);
		}
		try {
			return this._importScalarValue(value, interfacer);
		} catch (e) {
			if (e instanceof CastStringException) {
				// we don't want CastStringException but an UnexpectedValueTypeException
				this.verifValue(value);
			} else {
				throw e;
			}
		}
	}

	/**
	 * import interfaced value
	 *
	 * @param {*} value
	 * @param {Interfacer} interfacer
	 * @returns {string|void}
	 */
	_importScalarValue(value, interfacer) {
		return value;
	}

}

export default SimpleModel;
