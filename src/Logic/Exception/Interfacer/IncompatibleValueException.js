/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class IncompatibleValueException extends ComhonException {

	/**
	 *
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 */
	constructor(interfacedObject, interfacer) {
		let type;
		if (interfacedObject === null) {
			type = 'null';
		} else {
			type = (typeof interfacedObject === 'object') ? interfacedObject.constructor.name : (typeof interfacedObject);
		}
		super('value (' + type + ') imcompatible with interfacer (' + interfacer.constructor.name + ')');
	}

}

export default IncompatibleValueException;
