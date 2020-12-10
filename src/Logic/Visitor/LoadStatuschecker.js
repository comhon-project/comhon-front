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
 * verify if all objects are loaded (check recursively all contained objects)
 */
class LoadStatuschecker extends Visitor {

	/**
	 *
	 * @type {string[]}
	 */
	#stack = null;

	/**
	 *
	 * @type {boolean}
	 */
	#found = false;

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
		if ((object instanceof ComhonObject) && !object.isLoaded()) {
			this.#stack = [];
			this.#found = true;
		}
	}

	/**
	 * {@inheritDoc}
	 * @see {Visitor}::_visit()
	 */
	_visit(parentObject, key, propertyNameStack, isForeign) {
		const value = parentObject.getValue(key);

		if ((value instanceof ComhonObject) && !value.isLoaded()) {
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

export default LoadStatuschecker;
