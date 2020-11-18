/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ManifestException from 'Logic/Exception/Manifest/ManifestException';

class SerializationManifestIdException extends ManifestException {

	#type;
	#id;

	/**
	 *
	 * @param {string} type
	 * @param {string|integer} id
	 */
	constructor(type, id) {
		super(`impossible to load ${type} serialization with id '${id}'`);

		this.#type = type;
		this.#id = id;
	}

	/**
	 *
	 * @returns {string}
	 */
	getType() {
		return this.#type;
	}

	/**
	 *
	 * @returns {string|integer}
	 */
	getId() {
		return this.#id;
	}

}

export default SerializationManifestIdException;
