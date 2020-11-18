/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Property from 'Logic/Model/Property/Property';
import simpleModels from 'Logic/Model/Manager/SimpleModels';

class ForeignProperty extends Property {

	/**
	 *
	 * @param {ModelForeign} model
	 * @param {string} name
	 * @param {boolean} isPrivate
	 * @param {boolean} isRequired
	 * @param {boolean} isNotNull
	 * @param {boolean} dependencies
	 */
	constructor(model, name, isPrivate = false, isRequired = false, isNotNull = false, dependencies = []) {
		super(model, name, false, isPrivate, isRequired, isNotNull, null, null, [], dependencies);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::loadValue()
	 */
	async loadValue(object, propertiesFilter = null, forceLoad = false) {
		const model = await this.getModel();
		model.verifValue(object);
		if (object.isLoaded() && !forceLoad) {
			return false;
		}
		// TODO load value from server
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::isForeign()
	 */
	isForeign() {
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::getLiteralModel()
	 */
	async getLiteralModel() {
		if (this._getModel()._getModel().constructor.name !== 'Model') {
			return null;
		}
		const foreignModel = await this._getModel().getModel();
		return foreignModel.hasUniqueIdProperty()
			? foreignModel.getUniqueIdProperty().getLoadedModel()
			: simpleModels['string'];
	}

}

export default ForeignProperty;
