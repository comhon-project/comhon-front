/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @abstract
 */
class Utils {

	/**
	 * Checks if value is null or undefined.
	 * 
	 * @param {*} value 
	 */
	static isNil(value) {
		return value === null || value === undefined;
	}
	
}

export default Utils;
