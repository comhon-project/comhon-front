/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';
import ConstantException from 'Logic/Exception/ConstantException';

class UnexpectedValueTypeException extends ComhonException {

	/**
	 * @type {string}
	 */
	#expectedType;

	/**
	 * @param {*} value
	 * @param {string} expectedType
	 * @param {string} property
	 * @param {string} builtMessage override message exception
	 * @param {integer} code override code exception
	 */
	constructor(value, expectedType, property = null, builtMessage = null, code = null) {
		let type;
		if (value === null) {
			type = 'null';
		} else if (typeof value === 'object') {
			// cannot use (value instanceof AbstractComhonObject) due to a kind of import loop
			if (value.getClassName() === 'ComhonObject' || value.getClassName() === 'ComhonArray') {
				type = value.getComhonClass();
			} else {
				type = value.constructor.name;
			}
		} else {
			type = typeof value;
		}
		const stringValue = (value !== null && typeof value === 'object') || Array.isArray(value)
			? ' '
			: " '" + ((typeof value === 'boolean') ? (value ? 'true' : 'false') : value) + "' ";

		const stringProperty = (property === null) ? ' ' : ` of property '${property}' `;
		const message = `value${stringProperty}must be a ${expectedType}, ${type}${stringValue}given`;

		super(builtMessage ?? message, code ?? ConstantException.UNEXPECTED_VALUE_TYPE_EXCEPTION);
		this.#expectedType = expectedType;
	}

	/**
	 * get expected type
	 *
	 * @returns {string}
	 */
	getExpectedType() {
		return this.#expectedType;
	}

}

export default UnexpectedValueTypeException;
