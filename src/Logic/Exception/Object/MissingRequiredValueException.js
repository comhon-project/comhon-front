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

class MissingRequiredValueException extends ComhonException {

	/**
	 *
	 * @param {ComhonObject} object
	 * @param {string} propertyName
	 * @param {string} unset
	 */
	constructor(object, propertyName, unset = false) {
		const message = unset
			? `impossible to unset required value '${propertyName}' on comhon object with model '${object.getModel().getName()}'`
			: `missing required value '${propertyName}' on comhon object with model '${object.getModel().getName()}'`;
		super(message, ConstantException.MISSING_REQUIRED_VALUE_EXCEPTION);
	}

}

export default MissingRequiredValueException;
