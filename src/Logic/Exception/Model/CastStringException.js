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

class CastStringException extends ComhonException {

	/**
	 *
	 * @param {string} value
	 * @param {string} expected
	 * @param {string} property
	 */
	constructor(value, expected, property = null) {
		expected = Array.isArray(expected)
			? 'belong to enumeration ' + JSON.stringify(expected)
			: `be ${expected}`;
		const propertyMessage = (property === null) ? '' : ` for property '${property}'`;
		const message = `Cannot cast value '${value}'${propertyMessage}, value should ${expected}`;
		super(message, ConstantException.CAST_EXCEPTION);
	}

}

export default CastStringException;
