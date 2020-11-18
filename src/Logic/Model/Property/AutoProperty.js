/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Property from 'Logic/Model/Property/Property';
import ModelIndex from 'Logic/Model/ModelIndex';
import ComhonException from 'Logic/Exception/ComhonException';

class AutoProperty extends Property {

	#auto;

	static get INCREMENTAL() {return 'incremental';}

	/**
	 *
	 * @param {SimpleModel} model
	 * @param {string} name
	 * @param {boolean} isId
	 * @param {boolean} isPrivate
	 * @param {boolean} isRequired
	 * @param {boolean} isInterfacedAsNodeXml
	 * @param {string[]} dependencies
	 * @param {string} auto
	 * @throws {ComhonException}
	 */
	constructor(model, name, isId = false, isPrivate = false, isRequired = false, isInterfacedAsNodeXml = null, dependencies = [], auto = null) {
		super(model, name, isId, isPrivate, isRequired, true, null, isInterfacedAsNodeXml, [], dependencies);

		if (!(model instanceof ModelIndex) || auto !== AutoProperty.INCREMENTAL) {
			throw new ComhonException(`auto value 'auto' not allowed on property model '${model.getName()}'`);
		}
		this.#auto = auto;
	}

	/**
	 * return the function name that auto generate value
	 *
	 * @returns {string}
	 */
	getAutoFunction() {
		return this.#auto;
	}

}

export default AutoProperty;
