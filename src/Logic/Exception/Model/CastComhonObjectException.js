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

class CastComhonObjectException extends ComhonException {

	/**
	 * @param {Model} sourceModel
	 * @param {Model} destModel
	 */
	constructor(sourceModel, destModel) {
		const message = `Cannot cast object, '${sourceModel.getName()}' is not inherited from '${destModel.getName()}'`;
		super(message, ConstantException.CAST_EXCEPTION);
	}

}

export default CastComhonObjectException;
