/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';
import ComhonException from 'Logic/Exception/ComhonException';

class MainObjectCollection extends ObjectCollection {

	/**
	 * add object with mainModel (if not already added)
	 *
	 * @param {ComhonObject} object
	 * @param {boolean} throwException throw exception if object already added
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is added
	 */
	addObject(object, throwException = true) {
		if (!object.getModel().isMain()) {
			throw new ComhonException('model of given ComhonObject must be a main Model');
		}
		return super.addObject(object, throwException);
	}


	/**
	 * add object with mainModel (if not already added)
	 *
	 * @param {ComhonObject} object
	 * @throws {ComhonException}
	 * @returns {boolean} true if object is added
	 */
	removeObject(object, throwException = true) {
		if (!object.getModel().isMain()) {
			throw new ComhonException('model of given ComhonObject must be a main Model');
		}
		return super.removeObject(object, throwException);
	}
}

export default new MainObjectCollection();
