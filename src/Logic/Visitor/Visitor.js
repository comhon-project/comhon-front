/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonArray from 'Logic/Object/ComhonArray';
import AbstractComhonObject from 'Logic/Object/AbstractComhonObject';
import ComhonException from 'Logic/Exception/ComhonException';
import ParameterException from 'Logic/Exception/Visitor/ParameterException';
import VisitException from 'Logic/Exception/Visitor/VisitException';
import ArgumentException from 'Logic/Exception/ArgumentException';

/**
 * @abstract
 */
class Visitor {

	/** @type {ComhonObject} main object to visit */
	mainObject;

	/** @type {Object} parameters to apply on visitor */
	params;

	/** @type {Object} instances of all visisted objects to avoid infinite loop */
	#oids = {};

	/** @type {string[]} stack of all properies names  already visited */
	#propertyNameStack;

	constructor() {
		if (this.constructor === Visitor) {
			throw new Error('can\'t instanciate abstract class Visitor');
		}
	}

	/**
	 * execute visitor
	 *
	 * @param {AbstractComhonObject} object
	 * @param {array} params
	 * @returns {*}
	 */
	execute(object, params = {}) {
		if (!(object instanceof AbstractComhonObject)) {
			throw new ArgumentException(object, 'AbstractComhonObject', 1);
		}
		this._verifParameters(params);
		this.#oids = {};
		this.#propertyNameStack = [];
		this.mainObject = object;
		this.params = params;
		let result = null;

		try {
			if ((object instanceof ComhonArray) && object.getModel().isUniqueModelSimple()) {
				throw new ComhonException('cannot visit ComhonArray that contain a SimpleModel');
			}
			this._init(object);
			this._acceptChildren(object, false);
			result = this._finalize(object);
		} catch (e) {
			if (e instanceof VisitException) {
				throw e;
			} else {
				throw new VisitException(e, this.#propertyNameStack);
			}
		}

		return result;
	}

	/**
	 * accept to visit object of specified parent
	 *
	 * @private
	 * @param {AbstractComhonObject} parentObject
	 * @param {string} key
	 * @param {boolean} isForeign
	 */
	_accept(parentObject, key, isForeign) {
		const object = parentObject.getValue(key);
		if (object !== null) {
			this.#propertyNameStack.push(key);
			const visitChild = this._visit(parentObject, key, this.#propertyNameStack, isForeign);
			if (visitChild && (!isForeign || (object instanceof ComhonArray))) {
				this._acceptChildren(object, isForeign);
			}
			this._postVisit(parentObject, key, this.#propertyNameStack, isForeign);
			this.#propertyNameStack.pop();
		}
	}

	/**
	 * accept to visit children of specified object
	 *
	 * @private
	 * @param {AbstractComhonObject} object
	 * @param {boolean} isForeign
	 */
	_acceptChildren(object, isForeign) {
		if (object === null) {
			return;
		}
		if (object instanceof ComhonArray) {
			for (const keyAndValue of object) {
				this._accept(object, keyAndValue[0], isForeign);
			}
		}
		else if (!(object.getOid() in this.#oids)) {
			this.#oids[object.getOid()] = object;
			for (const property of object.getModel().getProperties()) {
				if (!property.isUniqueModelSimple()) {
					this._accept(object, property.getName(), property.isForeign());
				}
			}
			delete this.#oids[object.getOid()];
		}
	}


	/**
	 * verify parameters
	 *
	 * @private
	 * @param {Object} params
	 * @throws ParameterException
	 */
	_verifParameters(params) {
		const parameters = this._getMandatoryParameters();
		if (Array.isArray(parameters)) {
			if (parameters.length > 0) {
				if (params === null || typeof params !== 'object') {
					throw new ParameterException(parameters.join(', '));
				}
				for (const parameterName of parameters) {
					if (!(parameterName in params)) {
						throw new ParameterException(parameterName);
					}
				}
			}
		} else if (parameters !== null) {
			throw new ParameterException(null);
		}
	}

	/**
	 * get mandatory parameters
	 *
	 * permit to define mandatory parameters.
	 * an exception is thrown if there are missing parameters
	 *
	 * @abstract
	 * @returns {Object}
	 */
	_getMandatoryParameters() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * initialize visit
	 *
	 * permit to initialize some informations before visit
	 *
	 * @abstract
	 * @param {AbstractComhonObject} object
	 */
	_init(object) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * visit object in parentObject at key
	 *
	 * @abstract
	 * @param {AbstractComhonObject} parentObject
	 * @param {string} key
	 * @param {string} propertyNameStack
	 * @param {boolean} isForeign
	 */
	_visit(parentObject, key, propertyNameStack, isForeign) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * called after visting all children of current object
	 *
	 * @abstract
	 * @param {AbstractComhonObject} parentObject
	 * @param {string} key
	 * @param {string} propertyNameStack
	 * @param {boolean} isForeign
	 */
	_postVisit(parentObject, key, propertyNameStack, isForeign) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * finalize visit
	 *
	 * @abstract
	 * @param {AbstractComhonObject} object
	 * @returns {*} permit to return all needed information at the end of visit
	 */
	_finalize(object) {
		throw new Error('function must be overridden in children class');
	}
}

export default Visitor;
