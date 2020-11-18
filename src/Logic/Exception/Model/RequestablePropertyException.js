/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ConstantException from 'Logic/Exception/ConstantException';
import ComhonException from 'Logic/Exception/ComhonException';

class RequestablePropertyException extends ComhonException {

	/**
	 * @param {Property} property
	 * @param {Model} model
	 */
	constructor(property, model) {
		const isIdMessage = property.isId() ? ' id ' : ' ';
		const message = `cannot request ${isIdMessage}property '${property.getName()}' on model '${model.getName()}' in public context`;
		super(message, ConstantException.REQUESTABLE_PROPERTY_EXCEPTION);
	}

}

export default RequestablePropertyException;
