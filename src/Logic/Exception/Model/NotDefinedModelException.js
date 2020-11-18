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

class NotDefinedModelException extends ComhonException {

	/**
	 * @param {string} modelName
	 */
	constructor(modelName) {
		super(`manifest not found for model ${modelName}`, ConstantException.NOT_DEFINED_MODEL_EXCEPTION);
	}

}

export default NotDefinedModelException;
