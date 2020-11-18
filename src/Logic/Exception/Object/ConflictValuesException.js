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

class ConflictValuesException extends ComhonException {

	/**
	 *
	 * @param {Model} model
	 * @param {string[]} propertiesNames
	 */
	constructor(model, propertiesNames) {
		const message = 'properties values ' + JSON.stringify(propertiesNames)
			+ ` cannot coexist for model '${model.getName()}'`;
		super(message, ConstantException.CONFLICT_VALUES_EXCEPTION);
	}

}

export default ConflictValuesException;
