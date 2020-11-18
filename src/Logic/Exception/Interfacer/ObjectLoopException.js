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

class ObjectLoopException extends ComhonException {

	constructor() {
		super('Object loop detected, object contain itself', ConstantException.OBJECT_LOOP_EXCEPTION);
	}

}

export default ObjectLoopException;
