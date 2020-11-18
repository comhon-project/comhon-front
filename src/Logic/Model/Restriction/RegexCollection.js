/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Regex from 'Logic/Model/Restriction/Regex';
import Requester from 'Logic/Requester/Requester';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

class RegexCollection {

	#regexs = new Map();


	/**
	 * get regex according specified name.
	 * server is requested if regex is not registered.
	 *
	 * @async
	 * @param string name
	 * @throws {HTTPException}
	 * @returns string
	 */
	async getRegex(name) {
		if (this.#regexs.has(name)) {
			return this.#regexs.get(name);
		}

		const promise = Requester.get('pattern/'+name).then(xhr => {
			if (xhr.status === 401) {
				throw new HTTPException(xhr, `unauthorized to retrieve pattern '${name}'`);
			}
			if (xhr.status !== 200) {
				throw new HTTPException(xhr, `error when trying to retrieve pattern '${name}'`);
			}
			return xhr.responseText;
		});
		const regex = new Regex(promise);
		this.#regexs.set(name, regex);

		// await after set Map to be able to call getRegisteredRegex
		// and retrieve regex object without waiting
		try {
			await promise;
		} catch (e) {
			this.#regexs.delete(name);
			throw e;
		}

		return this.#regexs.get(name);
	}

	/**
	 * get registered regex according given name
	 *
	 * @param {string} name
	 * @return {Regex|void} null if there is no regex registered under given name
	 */
	getRegisteredRegex(name) {
		return this.#regexs.has(name) ? this.#regexs.get(name) : null;
	}


	/**
	 * verify if there is a regex registered under given name.
	 *
	 * @param {string} name
	 * @return {boolean}
	 */
	hasRegisteredRegex(name) {
		return this.#regexs.has(name);
	}

}

export default new RegexCollection();
