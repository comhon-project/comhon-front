/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';
import ConstantException from 'Logic/Exception/ConstantException';

class NoIdPropertyException extends ComhonException {

	/**
	 *
	 * @param {Model} model
	 */
	constructor(model) {
		const message = `model '${model.getName()}' doesn't have id property`;
		super(message, ConstantException.NO_ID_PROPERTY_EXCEPTION);
	}

}

export default NoIdPropertyException;
