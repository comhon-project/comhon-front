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

class UnexpectedModelException extends ComhonException {

	/**
	 * @param {AbstractModel} expectedModel
	 * @param {AbstractModel} actualModel
	 */
	constructor(expectedModel, actualModel) {
		const message = `model must be a '${expectedModel.getName()}', model '${actualModel.getName()}' given`;
		super(message, ConstantException.UNEXPECTED_MODEL_EXCEPTION);
	}

}

export default UnexpectedModelException;
