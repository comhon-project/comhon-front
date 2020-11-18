/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import SimpleModel from 'Logic/Model/SimpleModel';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';

class ModelString extends SimpleModel {

	/** @type {string} */
	static get ID() {return 'string';}

	constructor() {
		super(ModelString.ID);
	}

	/**
	 * verify if value is a string
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (typeof value !== 'string') {
			throw new UnexpectedValueTypeException(value, 'string');
		}
		return true;
	}

}

export default ModelString;
