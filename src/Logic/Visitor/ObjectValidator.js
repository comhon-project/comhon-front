/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Visitor from 'Logic/Visitor/Visitor';
import ObjectFinder from 'Logic/Visitor/ObjectFinder';
import ObjectCollectionInterfacer from 'Logic/Object/Collection/ObjectCollectionInterfacer';
import ComhonException from 'Logic/Exception/ComhonException';
import VisitException from 'Logic/Exception/Visitor/VisitException';
import NotReferencedValueException from 'Logic/Exception/Interfacer/NotReferencedValueException';
import ComhonObject from 'Logic/Object/ComhonObject';
import MissingIdForeignValueException from 'Logic/Exception/Value/MissingIdForeignValueException';

/**
 * verify if all objects are loaded (check recursively all contained objects)
 */
class ObjectValidator extends Visitor {

	/** @type {string} */
	static get VERIF_REFERENCES() {return 'verif_references';}

	/** @type {string} */
	static get VERIF_FOREIGN_ID() {return 'verif_foreign_id';}

	/**
	 * @type {boolean}
	 */
	#verifRef = false;

	/**
	 * @type {boolean}
	 */
	#verifForeignId = false;

	/**
	 *
	 * @type {ObjectCollectionInterfacer}
	 */
	#collection;

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_getMandatoryParameters()
	 */
	_getMandatoryParameters() {
		return [];
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_init()
	 */
	_init(object) {
		this.#verifRef = (ObjectValidator.VERIF_REFERENCES in this.params) ? this.params[ObjectValidator.VERIF_REFERENCES] : false;
		this.#verifForeignId = (ObjectValidator.VERIF_FOREIGN_ID in this.params) ? this.params[ObjectValidator.VERIF_FOREIGN_ID] : false;
		object.validate();
		if (this.#verifRef) {
			this.#collection = new ObjectCollectionInterfacer();
			if (object instanceof ComhonObject) {
				this.#collection.addObject(object, false);
			}
		}
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_visit()
	 */
	_visit(parentObject, key, propertyNameStack, isForeign) {
		const object = parentObject.getValue(key);
		if (object instanceof ComhonObject) {
			if (this.#verifRef) {
				this.#collection.addObject(object, isForeign);
			}
			if (!isForeign) {
				object.validate();
			} else if (this.#verifForeignId && !object.hasCompleteId()) {
				throw new MissingIdForeignValueException();
			}
		}
		return true;
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_postVisit()
	 */
	_postVisit(parentObject, key, propertyNameStack, isForeign) {}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_finalize()
	 */
	_finalize(object) {
		return new Promise((resolve, reject) => {
			if (this.#verifRef) {
				return this.#collection.getNotReferencedObjects().then(objects => {
					if (objects.length > 0) {
						const objectFinder = new ObjectFinder();
						for (const obj of objects) {
							const statck = objectFinder.execute(
								object,
								{
									[ObjectFinder.ID] : obj.getId(),
									[ObjectFinder.MODEL] : obj.getModel(),
									[ObjectFinder.SEARCH_FOREIGN] : true
								}
							);
							if (statck === null) {
								reject(new ComhonException('value should not be null'));
							}
							reject(new VisitException(new NotReferencedValueException(obj), statck));
						}
					}
					return resolve();
				});
			} else {
				return resolve();
			}
		});
	}
}

export default ObjectValidator;
