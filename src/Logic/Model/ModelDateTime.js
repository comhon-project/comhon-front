/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import SimpleModel from 'Logic/Model/SimpleModel';
import ComhonDateTime from 'Logic/Object/ComhonDateTime';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';

class ModelDateTime extends SimpleModel {

	/** @type {string} */
	static get ID() {return 'dateTime';}

	constructor() {
		super(ModelDateTime.ID);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {SimpleModel}::exportSimple()
	 */
	exportSimple(value, interfacer) {
		if (value === null) {
			return value;
		}
		return this.toString(value);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {SimpleModel}::_importScalarValue()
	 */
	_importScalarValue(value, interfacer) {
		if (typeof value !== 'string') {
			throw new UnexpectedValueTypeException(value, 'string');
		}
		return this.fromString(value);
	}

	/**
	 * instanciate ComhonDateTime object
	 *
	 * @param {string} time
	 * @returns {ComhonDateTime}
	 */
	fromString(time) {
		return new ComhonDateTime(time);
	}

	/**
	 *
	 * @param {ComhonDateTime} dateTime
	 * @param {string} dateFormat
	 * @returns {string}
	 */
	toString(dateTime) {
		return dateTime.toISOString();
	}

	/**
	 * verify if value is a ComhonDateTime object
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (!(value instanceof ComhonDateTime)) {
			throw new UnexpectedValueTypeException(value, 'ComhonDateTime');
		}
		return true;
	}
}

export default ModelDateTime;
