/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';

class ObjectCollectionBuilder {

	/**
	* build object collection that will store given object itslef (if has id)
	* and all its contained unique objects (with id)
	 *
	 * @param {AbstractComhonObject} object
	 * @param {boolean} addForeignObjects
	 * @param {boolean} visitForeignObjects
	 * @param {ObjectCollection} objectCollection you may populate an existing object collection
	 * @returns {ObjectCollection}
	 */
	static build(object, addForeignObjects = true, visitForeignObjects = false, objectCollection = null) {
		const stack = [[object, false, true, false]];
		const oids = {};
		let isForeign, add, isIsolated;

		if (objectCollection === null) {
			objectCollection = new ObjectCollection();
		}

		while (stack.length > 0) {
			[object, isForeign, add, isIsolated] = stack.pop();
			const hash = object.getOid();
			if (hash in oids) {
				continue;
			}
			oids[hash] = null;

			if (object.getClassName() === 'ComhonArray') {
				if (object.getUniqueModel().getClassName() === 'Model') {
					for (const [key, element] of object) {
						if (object.issetValue(key)) {
							stack.push([element, isForeign, add, object.getModel().isIsolatedElement()]);
						}
					}
				}
			} else {
				if (add) {
					objectCollection.addObject(object);
				}
				if (!isIsolated && (!isForeign || visitForeignObjects)) {
					for (const complexeProperty of object.getModel().getComplexProperties()) {
						const name = complexeProperty.getName();
						if (!object.issetValue(name)) {
							continue;
						}
						if (complexeProperty.isForeign()) {
							if (addForeignObjects || visitForeignObjects) {
								stack.push([object.getValue(name), complexeProperty.isForeign(), addForeignObjects, complexeProperty.isIsolated()]);
							}
						} else {
							stack.push([object.getValue(name), complexeProperty.isForeign(), true, complexeProperty.isIsolated()]);
						}
					}
				}
			}
		}

		return objectCollection;
	}
}

export default ObjectCollectionBuilder;
