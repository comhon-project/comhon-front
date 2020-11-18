/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class ParameterException extends ComhonException {

	/**
	 * @param {string} parameterName
	 */
	constructor(parameterName = null) {
		const message = (parameterName === null)
			? 'Bad parameters definition : must be an array or null'
			: `Missing parameter : '${parameterName}' must be specified`;

		super(message);
	}

}

export default ParameterException;
