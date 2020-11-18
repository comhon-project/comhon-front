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

class NotEmptyString extends Restriction {

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		return value.length > 0;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return this === restriction || ((restriction instanceof NotEmptyString));
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
		return this.satisfy(value)
			? 'value is not empty'
			: 'value is empty, value must be not empty';
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

export default NotEmptyString;
