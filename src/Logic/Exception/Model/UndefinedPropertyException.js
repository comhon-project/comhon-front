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

class UndefinedPropertyException extends ComhonException {

	/**
	 * @param {Model} model
	 * @param {string} propertyName
	 */
	constructor(model, propertyName) {
		const message = `Undefined property '${propertyName}' for model '${model.getName()}'`;
		super(message, ConstantException.UNDEFINED_PROPERTY_EXCEPTION);
	}

}

export default UndefinedPropertyException;
