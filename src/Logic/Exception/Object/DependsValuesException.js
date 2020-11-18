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

class DependsValuesException extends ComhonException {

	/**
	 * propertyOne depends on propertyTwo
	 *
	 * @param {string} propertyOne
	 * @param {string} propertyTwo
	 * @param {boolean} unset
	 */
	constructor(propertyOne, propertyTwo, unset = false) {
		const message = unset ? `property value '${propertyOne}' can't be unset when property value '${propertyTwo}' is set`
			: `property value '${propertyOne}' can't be set without property value '${propertyTwo}'`;
		super(message, ConstantException.DEPENDS_VALUES_EXCEPTION);
	}

}

export default DependsValuesException;
