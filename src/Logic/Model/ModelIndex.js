/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelInteger from 'Logic/Model/ModelInteger';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';

class ModelIndex extends ModelInteger {

	/** @type {string} */
	static get ID() {return 'index';}

	constructor() {
		super(ModelIndex.ID);
	}

	/**
	 * verify if value is a string
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		super.verifValue(value);
		if (value < 0) {
			throw new UnexpectedValueTypeException(value, 'positive integer (including 0)');
		}
		return true;
	}

}

export default ModelIndex;
