/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import SimpleModel from 'Logic/Model/SimpleModel';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import CastStringException from 'Logic/Exception/Model/CastStringException';

class ModelInteger extends SimpleModel {

	/** @type {string} */
	static get ID() {return 'integer';}

	constructor(name = null) {
		super(name ?? ModelInteger.ID);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {SimpleModel}::_importScalarValue()
	 */
	_importScalarValue(value, interfacer) {
		return this.castValue(value);
	}

	/**
	 * cast value to integer
	 *
	 * @param {string} value
	 * @param {string} property if value belong to a property, permit to be more specific if an exception is thrown
	 * @returns {integer}
	 */
	castValue(value, property = null) {
		if (Number.isInteger(value)) {
			return value;
		}
		if (isNaN(value)) {
			throw new CastStringException(value, 'integer', property);
		}
		const castedValue = parseFloat(value);
		if (!Number.isInteger(castedValue)) {
			throw new CastStringException(value, 'integer', property);
		}
		return castedValue;
	}

	/**
	 * verify if value is an integer
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (!Number.isInteger(value)) {
			throw new UnexpectedValueTypeException(value, 'integer');
		}
		return true;
	}
}

export default ModelInteger;
