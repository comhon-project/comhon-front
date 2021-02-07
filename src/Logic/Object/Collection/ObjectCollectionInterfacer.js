/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';
import ObjectCollectionBuilder from 'Logic/Object/Collection/ObjectCollectionBuilder';

class ObjectCollectionInterfacer {

	/**
	 *
	 * @type ObjectCollection
	 */
	#startObjectCollection;

	/**
	 *
	 * @type ObjectCollection
	 */
	#newObjectCollection;

	/**
	 *
	 * @type ObjectCollection
	 */
	#newForeignObjectCollection;

	/**
	 *
	 * @param {AbstractComhonObject} object if specified, populate start object collection
	 */
	constructor(object = null) {
		this.#startObjectCollection = object === null ? new ObjectCollection() : ObjectCollectionBuilder.build(object);
		this.#newForeignObjectCollection = new ObjectCollection();
		this.#newObjectCollection = new ObjectCollection();
	}

	/**
	 *
	 * @returns {ObjectCollection}
	 */
	getNewObjectCollection() {
		return this.newObjectCollection;
	}

	/**
	 *
	 * @returns {ObjectCollection}
	 */
	getNewForeignObjectCollection() {
		return this.newForeignObjectCollection;
	}

	/**
	 * get comhon object with specified model name if exists in :
	 * - new object collection
	 * - new foreign object collection
	 * - start object collection
	 *
	 * @param {string|integer} id
	 * @param {Model} model
	 * @param {boolean} inlcudeInheritance if true, search in extended model that share same id
	 * @returns {ComhonObject|void} null if not found
	 */
	getObject(id, model, inlcudeInheritance = true) {
		let obj;
		obj = this.#newObjectCollection.getObject(id, model, inlcudeInheritance);
		if (obj !== null) {
			return obj;
		}
		obj = this.#newForeignObjectCollection.getObject(id, model, inlcudeInheritance);
		if (obj !== null) {
			return obj;
		}
		return this.#startObjectCollection.getObject(id, model, inlcudeInheritance);
	}

	/**
	 * verify if comhon object with specified model name and id exists in new object collection
	 *
	 * @param {string|integer} id
	 * @param {Model} model
	 * @param {boolean} inlcudeInheritance if true, search in extended model that share same id
	 * @returns {boolean} true if exists
	 */
	hasNewObject(id, model, inlcudeInheritance = true) {
		return this.#newObjectCollection.hasObject(id, model, inlcudeInheritance);
	}

	/**
	 * add comhon object (if not already added) in :
	 * - new object collection if isForeign is false
	 * - new foreign object collection if isForeign is true
	 *
	 * @param {ComhonObject} object
	 * @param {boolean} isForeign if true, add object in new foreign object collection otherwise in new object collection
	 * @param {boolean} throwException if true, throw exception if another instance object already added
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is added
	 */
	addObject(object, isForeign, throwException = true) {
		if (isForeign) {
			return this.#newForeignObjectCollection.addObject(object, throwException);
		}
		return this.#newObjectCollection.addObject(object, throwException);
	}

	/**
	 * verify if comhon object with specified model name and id exists in start object collection
	 *
	 * @param {string|integer} id
	 * @param {Model} model
	 * @param {boolean} inlcudeInheritance if true, search in extended model that share same id
	 * @returns {boolean} true if exists
	 */
	hasStartObject(id, model, inlcudeInheritance = true) {
		return this.#startObjectCollection.hasObject(id, model, inlcudeInheritance);
	}

	/**
	 * add comhon object (if not already added) start object collection
	 *
	 * @param {ComhonObject} object
	 * @param {boolean} throwException it true, throw exception if another instance object already added
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is added
	 */
	addStartObject(object, throwException = true) {
		return this.#startObjectCollection.addObject(object, throwException);
	}

	/**
	 * get objects in newForeignObjectCollection that are not referenced in newObjectCollection.
	 * if object has a main model, it is not taken in account.
	 *
	 * @async
	 * @returns  {ComhonObject[]}
	 */
	async getNotReferencedObjects() {
		const notReferencedObjects = [];

		for (const key of this.#newForeignObjectCollection.getModelKeysIterator()) {
			for (const object of this.#newForeignObjectCollection.getObjectsIterator(key)) {
				if (!this.#newObjectCollection.hasObject(object.getId(), object.getModel()) && !object.getModel().isMain() && await !object.getModel().isRequestable()) {
					notReferencedObjects.push(object);
				}
			}
		}
		return notReferencedObjects;
	}

}

export default ObjectCollectionInterfacer;
