/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelContainer from 'Logic/Model/ModelContainer';
import ModelForeign from 'Logic/Model/ModelForeign';
import Model from 'Logic/Model/Model';
import ComhonArray from 'Logic/Object/ComhonArray';
import ObjectCollectionInterfacer from 'Logic/Object/Collection/ObjectCollectionInterfacer';
import Restriction from 'Logic/Model/Restriction/Restriction';
import NotNull from 'Logic/Model/Restriction/NotNull';
import Interfacer from 'Logic/Interfacer/Interfacer';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import ComhonException from 'Logic/Exception/ComhonException';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import UnexpectedArrayException from 'Logic/Exception/Value/UnexpectedArrayException';
import ImportException from 'Logic/Exception/Interfacer/ImportException';
import ExportException from 'Logic/Exception/Interfacer/ExportException';
import NotSatisfiedRestrictionException from 'Logic/Exception/Value/NotSatisfiedRestrictionException';
import IncompatibleValueException from 'Logic/Exception/Interfacer/IncompatibleValueException';
import ArgumentException from 'Logic/Exception/ArgumentException';

class ModelArray extends ModelContainer {

	/**
	 * @type {string} name of each element
	 *     for exemple if we have a ModelArray 'children', each element name would be 'child'
	 */
	#elementName;

	/**
	 * @type {boolean}
	 */
	#isAssociative;

	/**
	 * @type {boolean}
	 */
	#isNotNullElement;

	/**
	 * @type {boolean}
	 */
	#isIsolatedElement;

	/**
	 * @var {Restriction[]}
	 */
	#arrayRestrictions = [];

	/**
	 * @var {Restriction[]}
	 */
	#elementRestrictions = [];

	/**
	 *
	 * @param {AbstractModel} model
	 * @param {boolean} isAssociative
	 * @param {string} elementName
	 * @param {Restriction[]} arrayRestrictions
	 * @param {Restriction[]} elementRestrictions
	 * @param {boolean} isNotNullElement
	 * @param {boolean} isIsolatedElement
	 */
	constructor(model, isAssociative, elementName, arrayRestrictions = [], elementRestrictions = [], isNotNullElement = false, isIsolatedElement = false) {
		if (model instanceof ModelForeign) {
			throw new ArgumentException(model.getClassName(), ['ModelUnique', 'ModelArray'], 1);
		}
		super(model);
		this.#isAssociative = isAssociative;
		this.#elementName = elementName;
		this.#isNotNullElement = isNotNullElement;
		this.#isIsolatedElement = isIsolatedElement;
		this.#arrayRestrictions = arrayRestrictions;
		this.#elementRestrictions = elementRestrictions;

		if (this.#isIsolatedElement && !(this._getModel() instanceof Model)) {
			throw new ComhonException('only ModelArray with contained model instance of "Model" may be isolated');
		}
		for (const arrayRestriction of this.#arrayRestrictions) {
			if (!arrayRestriction.isAllowedModel(this)) {
				throw new ComhonException('restriction doesn\'t allow specified model'+this.getClassName());
			}
		}
		for (const elementRestriction of this.#elementRestrictions) {
			if (!elementRestriction.isAllowedModel(this._getModel())) {
				throw new ComhonException('restriction doesn\'t allow specified model'+this._getModel().getClassName());
			}
		}
		Object.freeze(this.#arrayRestrictions);
		Object.freeze(this.#elementRestrictions);
	}

	/**
	 * get class name
	 *
	 * @returns {string}
	 */
	getClassName() {
		return 'ModelArray';
	}

	/**
	 * get element name
	 *
	 * element name is used for xml interface
	 *
	 * @returns {string}
	 */
	getElementName() {
		return this.#elementName;
	}

	/**
	 * verify if array is associative
	 *
	 * @returns {boolean}
	 */
	isAssociative() {
		return this.#isAssociative;
	}

	/**
	 * verify if elements of comhon array must be not null
	 *
	 * @returns {boolean}
	 */
	isNotNullElement() {
		return this.#isNotNullElement;
	}

	/**
	 * verify if elements of comhon array are isolated
	 *
	 * @returns {boolean}
	 */
	isIsolatedElement() {
		return this.#isIsolatedElement;
	}

	/**
	 * get restrictions applied on comhon array itslef
	 *
	 * @returns {Restriction[]}
	 */
	getArrayRestrictions() {
		return this.#arrayRestrictions;
	}

	/**
	 * get restrictions applied on each comhon array element
	 *
	 * @returns {Restriction[]}
	 */
	getElementRestrictions() {
		return this.#elementRestrictions;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::getObjectInstance()
	 * @returns {ComhonArray}
	 */
	getObjectInstance(isloaded = true) {
		return new ComhonArray(this, isloaded);
	}

	/**
	 * get model array dimensions count
	 *
	 * @returns {integer}
	 */
	getDimensionsCount() {
		return this._getModel() instanceof ModelArray
			? (this._getModel().getDimensionsCount() + 1)
			: 1;
	}

	/**
	 * verify if during import we stay in first level object or not
	 *
	 * @param {boolean} isCurrentLevelFirstLevel
	 * @returns {boolean}
	 */
	_isNextLevelFirstLevel(isCurrentLevelFirstLevel) {
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_export()
	 * @param {boolean} isolate determine if each array elements must be isolated.
	 *                         this parameter may by true only if the exported root object is an array
	 *                         and if the parameter forceIsolateElements is set to true.
	 */
	_export(objectArray, nodeName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate = false) {
		/** @var {ComhonArray} objectArray */
		if (objectArray === null) {
			return null;
		}
		if (!isFirstLevel || interfacer.mustValidate()) {
			objectArray.validate();
		}
		const nodeArray = interfacer.createArrayNode(nodeName);
		isolate = isolate || this.#isIsolatedElement;

		let key, value, exportedValue;
		for ([key, value] of objectArray) {
			try {
				if ((value === null) && (nullNodes !== null)) {
					// if nullNodes is not null interfacer must be a xml interfacer
					exportedValue = interfacer.createNode(this.#elementName);
					nullNodes.push(exportedValue);
				} else {
					exportedValue = this.getLoadedModel()._export(value, this.#elementName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate);
				}
				if (this.#isAssociative) {
					interfacer.addAssociativeValue(nodeArray, exportedValue, key, this.#elementName);
				} else {
					interfacer.addValue(nodeArray, exportedValue, this.#elementName);
				}
			} catch (e) {
				throw new ExportException(e, key);
			}
		}
		return nodeArray;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_exportId()
	 */
	_exportId(objectArray, nodeName, interfacer, objectCollectionInterfacer, nullNodes) {
		const nodeArray = interfacer.createArrayNode(nodeName);

		let key, value, exportedValue;
		for ([key, value] of objectArray) {
			try {
				if (value === null) {
					if (nullNodes !== null) {
						// if nullNodes is not null interfacer must be a xml interfacer
						exportedValue = interfacer.createNode(this.#elementName);
						nullNodes.push(exportedValue);
					} else {
						exportedValue = null;
					}
				} else {
					exportedValue = this.getLoadedModel()._exportId(value, this.#elementName, interfacer, objectCollectionInterfacer, nullNodes);
				}
				if (this.#isAssociative) {
					interfacer.addAssociativeValue(nodeArray, exportedValue, key, this.#elementName);
				} else {
					interfacer.addValue(nodeArray, exportedValue, this.#elementName);
				}
			} catch (e) {
				throw new ExportException(e, key);
			}
		}
		return nodeArray;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_import()
	 *
	 * @returns {ComhonArray|void}
	 */
	async _import(interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		if (interfacer.isNullValue(interfacedObject)) {
			return null;
		}
		if (!interfacer.isArrayNodeValue(interfacedObject, this.#isAssociative)) {
			throw new UnexpectedValueTypeException(interfacedObject, interfacer.getArrayNodeClasses().join(' or '));
		}
		// ensure model is loaded
		await this.getModel();

		const objectArray = this.getObjectInstance(false);
		await this._fillObject(objectArray, interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer, isolate);
		return objectArray;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see \Comhon\Model\ModelContainer::_fillObject()
	 */
	async _fillObject(objectArray, interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		if (!(objectArray instanceof ComhonArray)) {
			throw new ArgumentException(objectArray, 'ComhonArray', 1);
		}
		isolate = isolate || this.#isIsolatedElement;
		const elements = this._getInterfacedElements(interfacedObject, interfacer);
		const keys = Array.isArray(elements) ? elements.keys() : Object.keys(elements);

		for (const key of keys) {
			try {
				const element = elements[key];
				const value = await this.getLoadedModel()._import(element, interfacer, isFirstLevel, objectCollectionInterfacer, isolate);
				if (this.#isAssociative) {
					objectArray.setValue(key, value, interfacer.hasToFlagValuesAsUpdated());
				} else {
					objectArray.pushValue(value, interfacer.hasToFlagValuesAsUpdated());
				}
			} catch (e) {
				if (e instanceof ComhonException) {
					throw new ImportException(e, key);
				} else {
					throw e;
				}
			}
		}
		if (!isFirstLevel || interfacer.mustValidate()) {
			objectArray.validate();
		}
		objectArray.setIsLoaded(true);
	}

	/**
	 * create object array and for each array element, create or get comhon object according interfaced id
	 *
	 * @async
	 * @param {*} interfacedId
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @returns {Promise<ComhonArray>}
	 */
	async _importId(interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer) {
		if (interfacer.isNullValue(interfacedObject)) {
			return null;
		}
		if (!interfacer.isArrayNodeValue(interfacedObject, this.#isAssociative)) {
			throw new UnexpectedValueTypeException(interfacedObject, interfacer.getArrayNodeClasses().join(' or '));
		}
		// ensure contained model is loaded
		await this.getModel();

		const objectArray = this.getObjectInstance(false);
		const elements = this._getInterfacedElements(interfacedObject, interfacer);
		const keys = Array.isArray(elements) ? elements.keys() : Object.keys(elements);

		for (const key of keys) {
			const element = elements[key];
			const value = await this.getLoadedModel()._importId(element, interfacer, false, objectCollectionInterfacer);
			if (this.#isAssociative) {
				objectArray.setValue(key, value, interfacer.hasToFlagValuesAsUpdated());
			} else {
				objectArray.pushValue(value, interfacer.hasToFlagValuesAsUpdated());
			}
		}
		if (!isFirstLevel || interfacer.mustValidate()) {
			objectArray.validate();
		}
		objectArray.setIsLoaded(true);
		return objectArray;
	}

	/**
	 * import interfaced array
	 *
	 * build comhon object array with values from interfaced object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {boolean} forceIsolateElements force isolate each elements of imported array
	 * (isolated element doesn't share objects instances with others elements)
	 * @throws {ComhonException}
	 * @returns {Promise<ComhonArray>}
	 */
	async import(interfacedObject, interfacer, forceIsolateElements = true) {
		try {
			return this._importRoot(interfacedObject, interfacer, null, forceIsolateElements);
		} catch (e) {
			if (e instanceof ComhonException) {
				throw new ImportException(e);
			} else {
				throw e;
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::fillObject()
	 * @param {boolean} forceIsolateElements force isolate each elements of imported array
	 * (isolated element doesn't share objects instances with others elements)
	 */
	async fillObject(objectArray, interfacedObject, interfacer, forceIsolateElements = true) {
		this.verifValue(objectArray);

		try {
			const imported = await this._importRoot(interfacedObject, interfacer, objectArray, forceIsolateElements);
			if (imported !== objectArray) {
				throw new ComhonException('invalid object instance');
			}
			return objectArray;
		} catch (e) {
			if (e instanceof ComhonException) {
				throw new ImportException(e);
			} else {
				throw e;
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_importRoot()
	 * @returns {ComhonArray}
	 */
	async _importRoot(interfacedObject, interfacer, rootObject = null, isolate = false) {
		if (!interfacer.isArrayNodeValue(interfacedObject, this.isAssociative)) {
			throw new IncompatibleValueException(interfacedObject, interfacer);
		}

		return super._importRoot(interfacedObject, interfacer, rootObject, isolate);
	}



	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_getRootObject()
	 */
	async _getRootObject(interfacedObject, interfacer) {
		return this.getObjectInstance(false);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelContainer}::_initObjectCollectionInterfacer()
	 */
	_initObjectCollectionInterfacer(objectArray, mergeType) {
		let objectCollectionInterfacer;
		const uniqueModel = this.getLoadedUniqueModel();

		if (uniqueModel instanceof Model && uniqueModel.hasIdProperties()) {
			if (mergeType === Interfacer.MERGE) {
				objectCollectionInterfacer = new ObjectCollectionInterfacer(objectArray);
			} else {
				objectCollectionInterfacer = new ObjectCollectionInterfacer();
				for (const value of ModelArray.getOneDimensionalValues(objectArray, true)) {
					objectCollectionInterfacer.addStartObject(value);
				}
			}
		} else {
			objectCollectionInterfacer = new ObjectCollectionInterfacer();
		}
		return objectCollectionInterfacer;
	}

	/**
	 * get object array values in one dimentional array
	 *
	 * @param {ComhonArray} objectArray
	 * @param {boolean} skipNullValues
	 * @returns {Array.}
	 */
	static getOneDimensionalValues(objectArray, skipNullValues = false) {
		let objectArrayElmt;
		const values = [];
		const stack = [objectArray];

		while (stack.length > 0) {
			objectArrayElmt = stack.pop();
			if (objectArrayElmt.getModel().getLoadedModel() instanceof ModelArray) {
				for (const keyAndValue of objectArrayElmt) {
					if (keyAndValue[1] !== null) {
						stack.push(keyAndValue[1]);
					}
				}
			} else {
				for (const keyAndValue of objectArrayElmt) {
					if (!skipNullValues || keyAndValue[1] !== null) {
						values.push(keyAndValue[1]);
					}
				}
			}
		}
		return values;
	}

	/**
	* get interfaced object elements. typically transfom xml node to array (or Object if array is associative).
	*
	* @private
	*/
	_getInterfacedElements(interfacedObject, interfacer) {
		return interfacer instanceof XMLInterfacer
			? (
					this.#isAssociative
						? this.interfacer.nodeToObject(interfacedObject)
						: this.interfacer.nodeToArray(interfacedObject)
				)
			: interfacedObject;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::verifValue()
	 */
	verifValue(value) {
		if (!(value instanceof ComhonArray)) {
			throw new UnexpectedValueTypeException(value, `ComhonArray(${this.getUniqueModelName()})`);
		}
		return this._verifModel(value.getModel(), value, 0);
	}

	/**
	 *
	 * @param {Model} modelArray
	 * @throws UnexpectedValueTypeException
	 * @throws UnexpectedArrayException
	 * @returns {boolean}
	 */
	_verifModel(model, value, depth) {
		if (model === this) {
			return true;
		}
		if (!(model instanceof ModelArray)) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (this.#isAssociative !== model.#isAssociative) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (this.#elementName !== model.#elementName) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (this.#isNotNullElement !== model.#isNotNullElement) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (this.#isIsolatedElement !== model.#isIsolatedElement) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (model.getLoadedModel() !== this._getModel()) {
			if (this._getModel() instanceof ModelArray) {
				this._getModel()._verifModel(model.getLoadedModel(), value, depth + 1);
			} else if (
					!(model.getLoadedModel() instanceof Model)
					|| !model.getLoadedModel().isInheritedFrom(this._getModel())
			) {
				throw new UnexpectedArrayException(value, this, depth);
			}
		}
		if (!Restriction.compare(this.#arrayRestrictions, model.getArrayRestrictions())) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		if (!Restriction.compare(this.#elementRestrictions, model.getElementRestrictions())) {
			throw new UnexpectedArrayException(value, this, depth);
		}
		return true;
	}

	/**
	 * verify if value is correct according element model in object array
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifElementValue(value) {
		if (value === null) {
			if (this.#isNotNullElement) {
				throw new NotSatisfiedRestrictionException(value, new NotNull());
			}
		} else {
			this.getLoadedModel().verifValue(value);
			const restriction = Restriction.getFirstNotSatisifed(this.#elementRestrictions, value);
			if (restriction !== null) {
				throw new NotSatisfiedRestrictionException(value, restriction);
			}
		}
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelContainer}::isEqual()
	 */
	isEqual(model) {
		return this === model || (super.isEqual(model) &&
			Restriction.compare(this.#arrayRestrictions, model.getArrayRestrictions()) &&
			Restriction.compare(this.#elementRestrictions, model.getElementRestrictions()));
	}

}

export default ModelArray;
