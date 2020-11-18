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

class AbstractObjectExportException extends ComhonException {

	/**
	 * @param {string} modelName
	 */
	constructor(modelName) {
		super(
			`model '${modelName}' is abstract. abstract model can't be exported`,
			ConstantException.ABSTRACT_OBJECT_EXPORT_EXCEPTION
		);
	}

}

export default AbstractObjectExportException;
