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

class InvalidCompositeIdException extends ComhonException {

	/**
	 * @param {string} id
	 */
	constructor(id) {
		super(`invalid composite id '${id}'`, ConstantException.INVALID_COMPOSITE_ID_EXCEPTION);

	}

}

export default InvalidCompositeIdException;
