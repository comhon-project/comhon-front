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

class AbstractObjectException extends ComhonException {

	/**
	 *
	 * @param {ComhonObject} comhonObject
	 */
	constructor(comhonObject) {
		const modelName = comhonObject.getModel().getName();
		const message = comhonObject.getModel().isAbstract()
			? `model '${modelName}' is abstract. Objects with abstract model cannot be flagged as loaded`
			: `error AbstractObjectException instanciated but model '${modelName}' is not abstract`;
		super(message, ConstantException.ABSTRACT_OBJECT_EXCEPTION);
	}

}

export default AbstractObjectException;
