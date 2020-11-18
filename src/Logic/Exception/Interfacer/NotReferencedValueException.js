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

class NotReferencedValueException extends ComhonException {

	/**
	 *
	 * @param {ComhonObject} object
	 */
	constructor(object) {
		const message = `foreign value with model '${object.getModel().getName()}' and id '${object.getId()}' not referenced in interfaced object`;
		super(message, ConstantException.NOT_REFERENCED_VALUE_EXCEPTION);
	}

}

export default NotReferencedValueException;
