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

class ReservedWordException extends ComhonException {

	/**
	 * @param {string} word
	 */
	constructor(word) {
		super(`reserved word '${word}' cannot be used in manifest`, ConstantException.RESERVED_WORD_EXCEPTION);
	}

}

export default ReservedWordException;
