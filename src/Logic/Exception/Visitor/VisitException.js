/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class VisitException extends ComhonException {

	/**
	 * @type {ComhonException}
	 */
	#originalException;

	/**
	 * @type {Array.}
	 */
	#stackProperties = [];

	/**
	 *
	 * @param {ComhonException} exception
	 * @param {string[]} stackProperties
	 */
	constructor(exception, stackProperties) {
		if (!(exception instanceof ComhonException)) {
			throw new Error('given exception is not instance of ComhonException');
		}
		const message = "Something goes wrong on '." + stackProperties.join('.') + "' object : \n" + exception.getMessage();
			super(message, exception.getCode());
			this.#originalException = exception;
			this.#stackProperties = stackProperties;
	}

	/**
	 * get original thrown exception
	 *
	 * @returns {ComhonException}
	 */
	getOriginalException() {
		return this.#originalException;
	}

	/**
	 * get stack properties encountered during visit
	 *
	 * @returns array
	 */
	getStackProperties() {
		return this.#stackProperties;
	}

	/**
	 * get stringified properties encountered during visit
	 *
	 * @returns {string}
	 */
	getStringifiedProperties() {
		return '.' + this.#stackProperties.join('.');
	}
}

export default VisitException;
