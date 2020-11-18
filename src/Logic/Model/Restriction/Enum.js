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
import ModelInteger from 'Logic/Model/ModelInteger';
import ModelFloat from 'Logic/Model/ModelFloat';

class Enum extends Restriction {

	/** @type {string[]|integer[]|float[]} */
	#enumeration = [];

	/**
	 *
	 * @param {string[]|integer[]|float[]} enumertation
	 */
	constructor(enumeration) {
		super();
		this.#enumeration = enumeration
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		return this.#enumeration.indexOf(value) !== -1;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		if (this === restriction) {
			return true;
		}
		if (!(restriction instanceof Enum)) {
			return false;
		}
		if (this.#enumeration.length !== restriction.#enumeration.length) {
			return false;
		}

		// copy and sort arrays
		const arr1 = this.#enumeration.concat().sort();
    const arr2 = restriction.#enumeration.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
			}
    }
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isAllowedModel()
	 */
	isAllowedModel(model) {
		return (model instanceof ModelInteger)
		|| (model instanceof ModelString)
		|| (model instanceof ModelFloat);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toMessage()
	 */
	toMessage(value) {
		if ((typeof value !== 'number') && (typeof value !== 'string')) {
			const type = (typeof value === 'object' && value !== null) ? value.constructor.name : (typeof value);
			return `Value passed to Enum must be an integer, float or string, instance of ${type} given`;
		}
		return '' + value + ' is' + (this.satisfy(value) ? ' ' : ' not ')
			+ 'in enumeration ' + JSON.stringify(this.#enumeration);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return JSON.stringify(this.#enumeration);
	}

}

export default Enum;
