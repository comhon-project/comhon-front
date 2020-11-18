/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Restriction from 'Logic/Model/Restriction/Restriction';
import ModelString from 'Logic/Model/ModelString';
import ComhonException from 'Logic/Exception/ComhonException';

class Regex extends Restriction {

	/** @type {string} */
	#regex;

	/** @type {string} */
	#flags;

	/** @type {string} */
	#regexObj;

	/**
	 *
	 * @param {string} regex regular expression
	 */
	constructor(regex, flags = '') {
		super();
		if (regex instanceof Promise) {
			regex.then((regexValue) => {
				[this.#regex, this.#flags] = Regex.extractPatternAndFlag(regexValue);
				this.#regexObj = new RegExp(this.#regex, this.#flags);
			}).catch((error) => {
				if (error instanceof ComhonException) {
					console.log(error.getMessage());
				} else {
					console.log('error when trying to retrieve pattern');
				}
			});
		} else {
			this.#regex = regex;
			this.#flags = flags;
			this.#regexObj = new RegExp(this.#regex, flags);
		}
	}

	/**
	 * extract pattern and flags.
	 * for example extract pattern '[A-Z]+' and flag 'si' from '/[A-Z]+/si'
	 *
	 * @returns {Array.string}
	 */
	static extractPatternAndFlag(regexValue) {
			const lastBackSlachIndex = regexValue.lastIndexOf('/');
			return [
				regexValue.substr(1, lastBackSlachIndex - 1),
				regexValue.substr(lastBackSlachIndex + 1)
			]
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		return this.#regexObj.test(value);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return this === restriction || (
			(restriction instanceof Regex)
			&& this.#regex === restriction.#regex
			&& this.#flags === restriction.#flags
		);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isAllowedModel()
	 */
	isAllowedModel(model) {
		return model instanceof ModelString;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toMessage()
	 */
	toMessage(value) {
		if (typeof value !== 'string') {
			const type = (typeof value === 'object' && value !== null) ? value.constructor.name : typeof value;
			return `Value passed to Regex must be a string, instance of ${type} given`;
		}
		return '' + value + (this.satisfy(value) ? ' ' : ' doesn\'t ')
			+ 'satisfy regex ' + this.#regex;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return this.#regex;
	}

}

export default Regex;
