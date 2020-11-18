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

class EnumerationException extends ComhonException {

	/**
	 * @param {*} value
	 * @param {Array.} enumeration
	 * @param {string} property
	 */
	constructor(value, enumeration, property) {
		const message = `value '${value}' of property '${property}' doesn't belong to enumeration '` + JSON.stringify(enumeration) + "'";
		super(message, ConstantException.ENUMERATION_EXCEPTION);
	}

}

export default EnumerationException;
