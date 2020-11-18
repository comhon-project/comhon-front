/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class InterfaceException extends ComhonException {

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
	 * @param {string} property
	 */
	constructor(exception, property = null) {
		let stackProperties = [], originalException;
		if (exception instanceof InterfaceException) {
			stackProperties = exception.getStackProperties();
			originalException = exception.getOriginalException();
		} else {
			originalException = exception;
		}
		if (property !== null) {
			stackProperties.push(property);
		}
		const stringifiedProperties = '.' + stackProperties.reverse().join('.');
		const message = `Something goes wrong on '${stringifiedProperties}' value : \n`
			+ originalException.getMessage();
		super(message, originalException.getCode());

		this.#stackProperties = stackProperties;
		this.#originalException = originalException;
	}

	/**
	 * get InterfaceException instance with specified properies
	 * stack must begin (index 0) by the last encountered property,
	 * stack must end with the first encountered property
	 *
	 * @param {ComhonException} exception
	 * @param {string[]} stackProperties
	 */
	static getInstanceWithProperties(exception, stackProperties) {
		const e = new InterfaceException(exception);
		e.#stackProperties = stackProperties;
		return e;
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
	 * get stack properties encountered during interface (export/import)
	 *
	 * stack begin (index 0) by the last encountered property,
	 * stack end with the first encountered property
	 *
	 * @returns {Array.}
	 */
	getStackProperties() {
		return this.#stackProperties;
	}

	/**
	 * get stringified properties encountered during interface (export/import)
	 *
	 * @returns {string}
	 */
	getStringifiedProperties() {
		return '.' + this.#stackProperties.reverse().join('.');
	}

}

export default InterfaceException;
