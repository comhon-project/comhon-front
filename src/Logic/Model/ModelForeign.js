/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelContainer from 'Logic/Model/ModelContainer';
import ComhonException from 'Logic/Exception/ComhonException';
import ObjectCollectionInterfacer from 'Logic/Object/Collection/ObjectCollectionInterfacer';

class ModelForeign extends ModelContainer {

	/**
	 *
	 * @param AbstractModel model
	 * @throws {ComhonException}
	 */
	constructor(model) {
		super(model);
		if (this.isUniqueModelSimple()) {
			throw new ComhonException('ModelForeign can\'t contain SimpleModel');
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_isNextLevelFirstLevel()
	 */
	_isNextLevelFirstLevel(isCurrentLevelFirstLevel) {
		return isCurrentLevelFirstLevel;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::getObjectInstance()
	 * @returns {ComhonObject|ComhonArray}
	 */
	getObjectInstance(isloaded = true) {
		return this.getLoadedModel().getObjectInstance(isloaded);
	}

	/**
	 * export comhon object to interfaced id in specified format
	 *
	 * {@inheritDoc}
	 * @see {ModelContainer}::_export()
	 */
	_export(object, nodeName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate = false) {
		if (object === null) {
			return null;
		}
		return this.getLoadedModel()._exportId(object, nodeName, interfacer, objectCollectionInterfacer, nullNodes);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_exportId()
	 */
	_exportId(object, nodeName, interfacer, objectCollectionInterfacer, nullNodes) {
		throw new ComhonException('should not call _exportId via ModelForeign');
	}

	/**
	 * import interfaced array
	 *
	 * build comhon object array with values from interfaced object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @throws {ComhonException}
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async import(interfacedObject, interfacer) {
		return this._import(interfacedObject, interfacer, true, new ObjectCollectionInterfacer());
	}

	/**
	 * import interfaced id
	 *
	 * {@inheritDoc}
	 * @see {ModelContainer}::_import()
	 */
	async _import(value, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		const model = await this.getModel();
		return model._importId(value, interfacer, isFirstLevel, objectCollectionInterfacer);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_importId()
	 */
	async _importId(interfacedId, interfacer, isFirstLevel, objectCollectionInterfacer) {
		throw new ComhonException('cannot call _importId via ModelForeign');
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::fillObject()
	 */
	async fillObject(object, interfacedObject, interfacer) {
		throw new ComhonException('cannot fill object via ModelForeign');
	}

	/**
	 * verify if value is correct according contained model
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		this.getLoadedModel().verifValue(value);
		return true;
	}
}

export default ModelForeign;
