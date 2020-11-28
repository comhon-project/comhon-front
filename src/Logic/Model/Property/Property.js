/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import SimpleModel from 'Logic/Model/SimpleModel';
import ModelContainer from 'Logic/Model/ModelContainer';
import ModelDateTime from 'Logic/Model/ModelDateTime';
import ComhonDateTime from 'Logic/Object/ComhonDateTime';
import ComhonException from 'Logic/Exception/ComhonException';
import Restriction from 'Logic/Model/Restriction/Restriction';
import NotSatisfiedRestrictionException from 'Logic/Exception/Value/NotSatisfiedRestrictionException';
import NotNull from 'Logic/Model/Restriction/NotNull';

class Property {

	/** @type {AbstractModel} */
	#model;

	/** @type {string} */
	#name;

		/** @type {boolean} */
	#isId;

	/** @type {boolean} */
	#isPrivate;

	/** @type {boolean} */
	#isRequired;

	/** @type {boolean} */
	#isNotNull;

	/** @type {boolean} */
	#isIsolated;

	/** @type {*}} */
	#default;

	/** @type {boolean} */
	#interfaceAsNodeXml;

	/** @type {Restriction[]} */
	#restrictions = [];

	/** @type {string[]} */
	#dependencies;

	/**
	 *
	 * @param {AbstractModel} model
	 * @param {string} name
	 * @param {boolean} isId
	 * @param {boolean} isPrivate
	 * @param {boolean} isRequired
	 * @param {boolean} isNotNull
	 * @param {*} default
	 * @param {boolean} isInterfacedAsNodeXml
	 * @param {Restriction[]} restrictions
	 * @param {string[]} dependencies
	 * @param {boolean} isIsolated
	 * @throws {ComhonException}
	 */
	constructor(model, name, isId = false, isPrivate = false, isRequired = false, isNotNull = false, defaultValue = null, isInterfacedAsNodeXml = null, restrictions = [], dependencies = [], isIsolated = false) {
		this.#model = model;
		this.#name = name;
		this.#isId = isId;
		this.#isPrivate = isPrivate;
		this.#isRequired = isRequired;
		this.#isNotNull = isNotNull;
		this.#isIsolated = isIsolated;
		this.#default = defaultValue;
		this.#dependencies = dependencies;

		if (this.#isIsolated && (model.getClassName() !== 'Model')) {
			throw new ComhonException('only property with model instance of "Model" may be isolated');
		}
		for (const restriction of restrictions) {
			if (!restriction.isAllowedModel(this.#model)) {
				throw new ComhonException('restriction doesn\'t allow specified model'+this.#model.getClassName());
			}
			this.#restrictions.push(restriction);
		}

		if (this.#model instanceof SimpleModel) {
			this.#interfaceAsNodeXml = isInterfacedAsNodeXml === null ? false : isInterfacedAsNodeXml;
		} else {
			if ((isInterfacedAsNodeXml !== null) && !isInterfacedAsNodeXml) {
				console.log('warning! 8th parameter is ignored, property with complex model is inevitably interfaced as node xml');
			}
			// without inheritance, foreign property may be exported as attribute because only id is exported
			// but due to inheritance, model name can be exported with id so we need to export as node
			this.#interfaceAsNodeXml = true;
		}

		if (this.#isId && !(this.#model instanceof SimpleModel)) {
			throw new ComhonException('property is defined as id, so argument 1 must be an instance of SimpleModel');
		}

		Object.freeze(this.#restrictions);
		Object.freeze(this.#dependencies);
	}

	/**
	 * get model
	 *
	 * @async
	 * @returns {Promise<Model|SimpleModel|ModelContainer>}
	 */
	async getModel() {
		await this.#model.load();
		return this.#model;
	}

	/**
	 * get model or model inside model container
	 *
	 * @async
	 * @returns {Promise<Model|SimpleModel>}
	 */
	async getUniqueModel() {
		let uniqueModel = this.#model;
		if (uniqueModel instanceof ModelContainer) {
			uniqueModel = await uniqueModel.getUniqueModel();
		}
		return uniqueModel;
	}



	/**
	 * get loaded model.
	 *
	 * if the contained model is a unique model and is not loaded, an exception is thrown.
	 *
	 * @returns {Model|SimpleModel|ModelContainer}
	 */
	getLoadedModel() {
    if (!this.#model.isLoaded()) {
      throw new ComhonException('model not loaded')
    }
		return this.#model;
	}

	/**
	 * verify if model or model inside model container is a simple model
	 *
	 * @returns {boolean}
	 */
	isUniqueModelSimple() {
		return this.#model instanceof ModelContainer
			? this.#model.isUniqueModelSimple()
			: this.#model instanceof SimpleModel;
	}

	/**
	 * get name
	 *
	 * @returns {string}
	 */
	getName() {
		return this.#name;
	}

	/**
	 * verify if property is an id
	 *
	 * @returns {boolean}
	 */
	isId() {
		return this.#isId;
	}

	/**
	 * verify if property is Private
	 *
	 * @returns {boolean}
	 */
	isPrivate() {
		return this.#isPrivate;
	}

	/**
	 * verify if property value is required.
	 * A loaded comhon object must have all its required values set (and not null).
	 *
	 * @returns {boolean}
	 */
	isRequired() {
		return this.#isRequired;
	}

	/**
	 * verify if property value must be not null
	 *
	 * @returns {boolean}
	 */
	isNotNull() {
		return this.#isNotNull;
	}

	/**
	 * verify if property value is isolated
	 *
	 * @returns {boolean}
	 */
	isIsolated() {
		return this.#isIsolated;
	}

	/**
	 * verify if property has default value
	 *
	 * @returns {boolean}
	 */
	hasDefaultValue() {
		return this.#default !== null;
	}

	/**
	 * get default value if exists
	 *
	 * @returns {*|void} null if property doesn't have default value
	 */
	getDefaultValue() {
		if (this.#model instanceof ModelDateTime) {
			return new ComhonDateTime(this.#default);
		}
		return this.#default;
	}

	/**
	 * verify if property is aggregation
	 *
	 * @returns {boolean}
	 */
	isAggregation() {
		return false;
	}

	/**
	 * verify if property is foreign
	 *
	 * @returns {boolean}
	 */
	isForeign() {
		return false;
	}

	/**
	 * verify if model property is complex
	 *
	 * @returns {boolean}
	 */
	isComplex() {
		return this.#model.isComplex();
	}

	/**
	 * verify if property has model ModelDateTime
	 *
	 * @returns {boolean}
	 */
	hasModelDateTime() {
		return (this.#model instanceof ModelDateTime);
	}

	/**
	 * get restrictions
	 *
	 * @returns {Restriction[]}
	 */
	getRestrictions() {
		return this.#restrictions;
	}

	/**
	 * verify if property depends on other properties.
	 * a property depends on other properties if property value MAY be set only if other properties values are set.
	 *
	 * @returns {boolean}
	 */
	hasDependencies() {
		return this.#dependencies.length > 0;
	}

	/**
	 * get names of dependency properties.
	 * dependencies values MUST be set when current property value is set
	 *
	 * @returns {Array}
	 */
	getDependencies() {
		return this.#dependencies;
	}

	/**
	 * verify if property is interfaceable for export/import in Public/Private mode
	 *
	 * @param {boolean} isPrivate if true Private mode, otherwise public mode
	 * @returns {boolean} true if property is interfaceable
	 */
	isInterfaceable(isPrivate) {
		return (isPrivate || !this.#isPrivate);
	}

	/**
	 * validate value regarding restrictions property.
	 * throw exception if value is not valid.
	 *
	 * @param {*} value
	 */
	validate(value) {
		if (value === null) {
			if (this.#isNotNull) {
				throw new NotSatisfiedRestrictionException(value, new NotNull());
			}
		} else {
			this.#model.verifValue(value);
			if (this.#restrictions.length > 0) {
				const restriction = Restriction.getFirstNotSatisifed(this.#restrictions, value);
				if (restriction !== null) {
					throw new NotSatisfiedRestrictionException(value, restriction);
				}
			}
		}
	}

	/**
	 * verify if value is valid regarding restrictions property
	 *
	 * @param {*} value
	 * @returns {boolean} true if property is valid
	 */
	isValid(value) {
		if (value === null) {
			return !this.#isNotNull;
		}
		try {
			this.#model.verifValue(value);
		} catch (e) {
			return false;
		}
		return Restriction.getFirstNotSatisifed(this.#restrictions, value) === null;
	}

	/**
	 * verify if property is exported/imported as node for xml export/import
	 *
	 * @returns {boolean} true if property is interfaceable
	 */
	isInterfacedAsNodeXml() {
		return this.#interfaceAsNodeXml;
	}

	/**
	 * get aggregation properties names if exist
	 *
	 * @returns {string[]|void} null if there are no aggregation properties
	 */
	getAggregationProperties() {
		return null;
	}

	/**
	 * load specified value
	 *
	 * @async
	 * @param {ComhonObject} object
	 * @param {string[]} propertiesFilter
	 * @param {boolean} forceLoad if object is already loaded, force to reload object
	 * @return {Promise<boolean>} true if object is successfully loaded, false otherwise
	 */
	async loadValue(object, propertiesFilter = [], forceLoad = false) {
		throw new ComhonException('cannot load object, property is not foreign property');
	}

	/**
	 * get property model that permit to build literal
	 *
	 * @async
	 * @returns {Promise<SimpleModel|void>}
	 */
	async getLiteralModel() {
		const model = await this.getModel();
		return (model instanceof SimpleModel) ? model : null;
	}

	/**
	 * verify if specified property is equal to this property
	 *
	 * verify if properties are same instance or if they have same attributes
	 *
	 * @param {Property} property
	 * @returns {boolean}
	 */
	isEqual(property) {
		return this === property || (
			this.constructor.name === property.constructor.name &&
			this.#name            === property.getName() &&
			this.#isId            === property.isId() &&
			this.#isPrivate       === property.isPrivate() &&
			this.#isRequired      === property.isRequired() &&
			this.#default         === property.getDefaultValue() &&
			this.#isNotNull       === property.isNotNull() &&
			this.#isIsolated      === property.isIsolated() &&
			this.#dependencies.length === property.getDependencies().length &&
			property.getDependencies().every((value) => this.#dependencies.indexOf(value) !== -1) &&
			this.#model.isEqual(property.#model) &&
			Restriction.compare(this.#restrictions, property.getRestrictions())
		);
	}

}

export default Property;
