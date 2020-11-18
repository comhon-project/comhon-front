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

class NotExistingRegexException extends ComhonException {

	/**
	 * @param {string} regexName
	 */
	constructor(regexName) {
		super(`regex with name '${regexName}' doesn't exist`, ConstantException.NOT_EXISTING_REGEX_EXCEPTION);
	}

}

export default NotExistingRegexException;
