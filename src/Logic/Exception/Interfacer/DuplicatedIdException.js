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

class DuplicatedIdException extends ComhonException {

	/**
	 * @param {string} id
	 */
	constructor(id) {
		super(`Duplicated id '${id}'`, ConstantException.DUPLICATED_ID_EXCEPTION);
	}

}

export default DuplicatedIdException;
