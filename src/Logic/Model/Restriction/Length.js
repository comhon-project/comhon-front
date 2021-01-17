/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Interval from 'Logic/Model/Restriction/Interval';
import ModelString from 'Logic/Model/ModelString';
import simpleModels from 'Logic/Model/Manager/SimpleModels';

class Length extends Interval {

	constructor(interval) {
		super(interval, simpleModels['integer']);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		return (typeof value === 'string') && super.satisfy(value.length);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return super.isEqual(restriction) && (restriction instanceof Length);
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
			return `Value passed to Length must be a string, instance of ${type} given`;
		}

		return 'length ' + value.length + ' of given string'
			+ ' is' + (this.satisfy(value) ? ' ' : ' not ')
			+ 'in length range '
			+ (this.isLeftClosed() ? '[' : ']')
			+ this.getLeftEndPoint()
			+ ','
			+ this.getRightEndPoint()
			+ (this.isRightClosed() ? ']' : '[');
	}

}

export default Length;
