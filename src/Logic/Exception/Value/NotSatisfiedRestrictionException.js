/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import ConstantException from 'Logic/Exception/ConstantException';

class NotSatisfiedRestrictionException extends UnexpectedValueTypeException {

	/**
	 * @type {*}
	 */
	#value;

	/**
	 * @type {Restriction}
	 */
	#restriction;

	/**
	 * @type {integer}
	 */
	#increment;

	/**
	 * @param {*} value
	 * @param {Restriction} restriction
	 * @param {integer} increment
	 */
	constructor(value, restriction, increment = 0) {
		super(null, null, null, restriction.toMessage(value, increment), ConstantException.NOT_SATISFIED_RESTRICTION_EXCEPTION);
		this.#value = value;
		this.#restriction = restriction;
		this.#increment = increment;
	}

	/**
	 * get value
	 *
	 * @returns {*}
	 */
	getValue() {
		return this.#value;
	}

	/**
	 * get restriction
	 *
	 * @returns {Restriction}
	 */
	getRestriction() {
		return this.#restriction;
	}

	/**
	 * get increment
	 *
	 * @returns {integer}
	 */
	getIncrement() {
		return this.#increment;
	}

}

export default NotSatisfiedRestrictionException;
