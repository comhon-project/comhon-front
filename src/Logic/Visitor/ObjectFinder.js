/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Visitor from 'Logic/Visitor/Visitor';
import ComhonObject from 'Logic/Object/ComhonObject';

/**
 * instanciate and populate ObjectCollection
 */
class ObjectFinder extends Visitor {

	/** @type {string} */
	static get ID() {return 'id';}

	/** @type {string} */
	static get MODEL() {return 'model';}

	/** @type {string} */
	static get SEARCH_FOREIGN() {return 'searchForeign';}

	/**
	 *
	 * @type {string|number}
	 */
	#id;

	/**
	 *
	 * @type {Model}
	 */
	#model;

	/**
	 *
	 * @type {boolean}
	 */
	#searchForeign = false;

	/**
	 *
	 * @type {boolean}
	 */
	#found = false;

	/**
	 *
	 * @type {string[]}
	 */
	#stack = null;

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_getMandatoryParameters()
	 */
	_getMandatoryParameters() {
		return [ObjectFinder.ID, ObjectFinder.MODEL, ObjectFinder.SEARCH_FOREIGN];
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_init()
	 */
	_init(object) {
		this.#id = this.params[ObjectFinder.ID];
		this.#model = this.params[ObjectFinder.MODEL];
		this.#searchForeign = (ObjectFinder.SEARCH_FOREIGN in this.params) ? this.params[ObjectFinder.SEARCH_FOREIGN] : false;
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_visit()
	 */
	_visit(parentObject, key, propertyNameStack, isForeign) {
		const value = parentObject.getValue(key);

		if ((value instanceof ComhonObject) && value.getId() === this.#id && value.getModel() === this.#model) {
			this.#stack = propertyNameStack;
			this.#found = true;
		}

		return !this.#found;
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
		return this.#stack;
	}
}

export default ObjectFinder;
