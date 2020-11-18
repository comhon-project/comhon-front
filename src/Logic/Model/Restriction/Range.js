/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Regex from 'Logic/Model/Restriction/Regex';
import ModelString from 'Logic/Model/ModelString';

/**
 * Range restriction permit to know if a string is a valid range (examples : 1-10, 20-20, 0-8...)
 */
class Range extends Regex {

	/**
	 *
	 * @param {string} regex regular expression
	 */
	constructor() {
		super('/^\\d+-\\d+/');
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		if (!super.satisfy(value)) {
			return false;
		}
		let first, last;
		[first, last] = value.split('-');

		return (1 + last - first) > 0;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return restriction instanceof Regex;
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
			+ 'satisfy range format \'x-y\' where x and y are integer and x<=y';
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return 'x-y';
	}

}

export default Range;
