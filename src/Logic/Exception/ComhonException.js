/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class ComhonException {

	/**
	 * @type {string}
	 */
	#message = '';

	/**
	 * @type {integer}
	 */
	#code = 0;

	/**
	 *
	 * @param {string} message
	 * @param {integer} code
	 */
	constructor(message = '', code = 0) {
		this.#message = message;
		this.#code = code;
	}

	/**
	 * get exception message
	 *
	 * @returns {string}
	 */
	getMessage() {
		return this.#message;
	}

	/**
	 * get exception code
	 *
	 * @returns {integer}
	 */
	getCode() {
		return this.#code;
	}

}

export default ComhonException;
