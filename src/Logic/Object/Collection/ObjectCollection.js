/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class ObjectCollection {

	/**
	 *
	 * @type {ComhonObject[][]}
	 */
	#map = new Map();

	/**
	 * get model that will be used to store object with specified model.
	 * returned model may be different than specified model due to shared id
	 *
	 * @param {Model} model
	 * @returns {Model}
	 */
	static getModelKey(model) {
		return model.getSharedIdModel() === null ? model : model.getSharedIdModel();
	}

	/**
	 * get array map that store all objects by model name and by id
	 *
	 * @returns {ComhonObject[][]}
	 */
	getMap() {
		return this.#map;
	}

	/**
	 * get comhon object with specified model name (if exists in ObjectCollection)
	 *
	 * @param {string|integer} id
	 * @param {Model} model
	 * @param {boolean} includeInheritance if true, search in extended model that share same id
	 * @returns {ComhonObject|void} null if not found
	 */
	getObject(id, model, includeInheritance = true) {
		if (id === null) {
			return null;
		}
		let object = null;
		const key = ObjectCollection.getModelKey(model).getName();

		if (this.#map.has(key) && this.#map.get(key).has(id)) {
			const objectTemp = this.#map.get(key).get(id);
			if (objectTemp.isA(model) || (includeInheritance && model.isInheritedFrom(objectTemp.getModel()))) {
				object = objectTemp;
			}
		}

		return object;
	}

	/**
	 * verify if comhon object with specified model name and id exists in ObjectCollection
	 *
	 * @param {string|integer} id
	 * @param {Model} model
	 * @param {boolean} includeInheritance if true, search in extended model that share same id
	 * @returns {boolean} true if exists
	 */
	hasObject(id, model, includeInheritance = true) {
		return this.getObject(id, model, includeInheritance) !== null;
	}

	/**
	 * add comhon object (if not already added)
	 *
	 * @param {ComhonObject} object
	 * @param {boolean} throwException it true, throw exception if another instance object already added
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is added
	 */
	addObject(object, throwException = true) {
		let success = false;

		if (!object.hasCompleteId() || !object.getModel().hasIdProperties()) {
			return success;
		}
		const id = object.getId();
		const key = ObjectCollection.getModelKey(object.getModel()).getName();

		if (this.#map.has(key) && this.#map.get(key).has(id)) {
			if (throwException && this.#map.get(key).get(id) !== object) {
				throw new ComhonException(`different objects with same id. shared id model: '${key}', id: '${id}'`);
			}
		} else {
			if (!this.#map.has(key)) {
				this.#map.set(key, new Map());
			}
			this.#map.get(key).set(id, object);
			success = true;
		}

		return success;
	}

	/**
	 * remove comhon object from collection if exists
	 *
	 * @param {ComhonObject} object
	 * @param {boolean} throwException it true, throw exception if another instance object exists
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is removed
	 */
	removeObject(object, throwException = true) {
		let success = false;

		if (!object.hasCompleteId() || !object.getModel().hasIdProperties()) {
			return success;
		}
		const id = object.getId();
		const key = ObjectCollection.getModelKey(object.getModel()).getName();

		if (this.#map.has(key) && this.#map.get(key).has(id)) {
			if (this.#map.get(key).get(id) === object) {
				this.#map.get(key).delete(id);
				success = true;
			} else if (throwException) {
				throw new ComhonException(`different objects with same id. shared id model: '${key}', id: '${id}'`);
			}
		}

		return success;
	}

	/**
	 * reset object collection
	 */
	reset() {
		this.#map = new Map();
	}

}

export default ObjectCollection;
