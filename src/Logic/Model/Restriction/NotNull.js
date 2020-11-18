/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Restriction from 'Logic/Model/Restriction/Restriction';

class NotNull extends Restriction {

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		return value !== null;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return this === restriction || ((restriction instanceof NotNull));
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isAllowedModel()
	 */
	isAllowedModel(model) {
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toMessage()
	 */
	toMessage(value) {
		return this.satisfy(value)
			? 'not null value given'
			: 'null value given, value must be not null';
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return 'Not null';
	}

}

export default NotNull;
