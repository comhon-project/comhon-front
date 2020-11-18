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

class ContextIdException extends ComhonException {

	constructor() {
		super('Cannot interface foreign value with private id in public context', ConstantException.CONTEXT_ID_EXCEPTION);
	}

}

export default ContextIdException;
