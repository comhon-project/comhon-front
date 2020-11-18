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

class ModelFloat extends SimpleModel {

	/** @type {string} */
	static get ID() {return 'float';}


	constructor() {
		super(ModelFloat.ID);
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
	 * cast value to float
	 *
	 * @param {string} value
	 * @param {string} property if value belong to a property, permit to be more specific if an exception is thrown
	 * @returns {float}
	 */
	castValue(value, property = null) {
		if (typeof value === 'number') {
			return value;
		}
		if (isNaN(value)) {
			throw new CastStringException(value, 'float', property);
		}
		return parseFloat(value);
	}

	/**
	 * verify if value is a float (or an integer)
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (typeof value !== 'number') {
			throw new UnexpectedValueTypeException(value, 'double');
		}
		return true;
	}

}

export default ModelFloat;
