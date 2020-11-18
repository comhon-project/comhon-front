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

class NotSupportedModelIntervalException extends ComhonException {

	/**
	 * @param {AbstractModel} model
	 */
	constructor(model) {
		super(
			`interval cannot be defined on model '${model.getName()}'`,
			ConstantException.NOT_SUPPORTED_MODEL_INTERVAL_EXCEPTION
		);
	}

}

export default NotSupportedModelIntervalException;
