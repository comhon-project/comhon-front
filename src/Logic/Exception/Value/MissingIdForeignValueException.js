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

class MissingIdForeignValueException extends ComhonException {

	constructor() {
		super('missing or not complete id on foreign value', ConstantException.MISSING_ID_FOREIGN_VALUE_EXCEPTION);

	}

}

export default MissingIdForeignValueException;
