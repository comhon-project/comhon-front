/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Restriction from 'Logic/Model/Restriction/Restriction';
import ModelArray from 'Logic/Model/ModelArray';
import ComhonArray from 'Logic/Object/ComhonArray';

class NotEmptyArray extends Restriction {

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 * @param {integer} increment permit to verify if restriction is satisfied if add or remove one or several values on array
	 */
	satisfy(value, increment = 0) {
		return (value instanceof ComhonArray) ?  (value.count() + increment > 0) : value.length > 0;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return this === restriction || ((restriction instanceof NotEmptyArray));
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isAllowedModel()
	 */
	isAllowedModel(model) {
		return model instanceof ModelArray;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toMessage()
	 * @param {integer} increment
	 */
	toMessage(value, increment = 0) {
		return this.satisfy(value, increment)
			? 'value is not empty'
			: (increment === -1
				? 'trying to modify comhon array and make it empty, value must be not empty'
				: 'value is empty, value must be not empty');
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return 'Not empty';
	}

}

export default NotEmptyArray;
