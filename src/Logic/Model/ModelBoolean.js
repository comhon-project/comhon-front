/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import SimpleModel from 'Logic/Model/SimpleModel';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import CastStringException from 'Logic/Exception/Model/CastStringException';

class ModelBoolean extends SimpleModel {

	/** @type {string} */
	static get ID() {return 'boolean';}

	constructor() {
		super(ModelBoolean.ID);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {SimpleModel}::exportSimple()
	 *
	 * @returns {boolean|void}
	 */
	exportSimple(value, interfacer) {
		if (value === null) {
			return value;
		}
		if (interfacer instanceof XMLInterfacer) {
			return value ? '1' : '0';
		}
		return value;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {SimpleModel}::_importScalarValue()
	 *
	 * @returns {boolean|void}
	 */
	_importScalarValue(value, interfacer) {
		return this.castValue(value);
	}

	/**
	 * cast value to boolean
	 *
	 * @param {string} value
	 * @param {string} property if value belong to a property, permit to be more specific if an exception is thrown
	 * @returns {boolean}
	 */
	castValue(value, property = null) {
		if (typeof value === 'boolean') {
			return value;
		}
		if (value === '1') {
			return true;
		}
		if (value === '0') {
			return false;
		}
		throw new CastStringException(value, ['0', '1'], property);
	}

	/**
	 * verify if value is a boolean
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (typeof value !== 'boolean') {
			throw new UnexpectedValueTypeException(value, 'boolean');
		}
		return true;
	}

}

export default ModelBoolean;
