/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class ArgumentException extends ComhonException {

	/**
	 *
	 * @param {*} argument
	 * @param {string|Array.} expected
	 * @param {integer} index start from 1
	 * @param {Array.} enumeration specify it only if argument doesn't belong to an enumeration
	 */
	constructor(argument, expected, index, enumeration = null) {
		let type;
		if (argument === null) {
			type = null;
		} else if (typeof argument === 'object') {
			// cannot use (argument instanceof AbstractComhonObject) due to a kind of import loop
			if (argument.getClassName() === 'ComhonObject' || argument.getClassName() === 'ComhonArray') {
				type = argument.getComhonClass();
			} else {
				type = argument.constructor.name;
			}
		} else {
			type = typeof argument;
		}

		expected = Array.isArray(expected)
			? 'be one of ' + JSON.stringify(expected)
			: `be a ${expected}` + (Array.isArray(enumeration) ? (" that belong to " + JSON.stringify(enumeration)) : '');

		const value = Array.isArray(enumeration) && ((typeof argument === 'string') || (typeof argument === 'number')) ? ` '${argument}' ` : ' ' ;

		const message = `Argument at index ${index} `
			+ `must ${expected}, ${type}${value}given.`;

		super(message);
	}

}

export default ArgumentException;
