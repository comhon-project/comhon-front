/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Interval from 'Logic/Model/Restriction/Interval';
import ModelArray from 'Logic/Model/ModelArray';
import ComhonArray from 'Logic/Object/ComhonArray';
import simpleModels from 'Logic/Model/Manager/SimpleModels';

class Size extends Interval {

	constructor(interval) {
		super(interval, simpleModels['integer']);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 * @param {integer} increment permit to verify if restriction is satisfied if add or remove one or several values on array
	 */
	satisfy(value, increment = 0) {
		return (value instanceof ComhonArray) && super.satisfy(value.count() + increment);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return super.isEqual(restriction) && (restriction instanceof Size);
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
	 * @see {Restriction}::toString()
	 * @param {integer} increment
	 */
	toMessage(value, increment = 0) {
		if (!(value instanceof ComhonArray)) {
			const type = (typeof value === 'object' && value !== null) ? value.constructor.name : typeof value;
			return `Value passed to Size must be an ComhonArray, instance of ${type} given`;
		}

		return (increment !== 0 ? ('trying to modify comhon array from size ' + value.count() + ' to ' + (value.count() + increment) + '. ') : '')
			+ 'size ' + (value.count() + increment) + ' of given array'
			+ ' is' + (this.satisfy(value, increment) ? ' ' : ' not ')
			+ 'in size range '
			+ (this.isLeftClosed() ? '[' : ']')
			+ this.getLeftEndPoint()
			+ ','
			+ this.getRightEndPoint()
			+ (this.isRightClosed() ? ']' : '[');
	}

}

export default Size;
