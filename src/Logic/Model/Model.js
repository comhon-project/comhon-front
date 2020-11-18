/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelComplex from 'Logic/Model/ModelComplex';
import ModelArray from 'Logic/Model/ModelArray';
import ModelForeign from 'Logic/Model/ModelForeign';
import ModuleBridge from 'Logic/ModuleBridge/ModuleBridge';
import Interfacer from 'Logic/Interfacer/Interfacer';
import ComhonObject from 'Logic/Object/ComhonObject';
import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';
import MainObjectCollection from 'Logic/Object/Collection/MainObjectCollection';
import ObjectCollectionInterfacer from 'Logic/Object/Collection/ObjectCollectionInterfacer';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import ModelManager from 'Logic/Model/Manager/ModelManager';
import ObjectFinder from 'Logic/Visitor/ObjectFinder';
import Requester from 'Logic/Requester/Requester';
import ApiModelNameManager from 'Logic/Model/Manager/ApiModelNameManager';
import ComhonException from 'Logic/Exception/ComhonException';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import ImportException from 'Logic/Exception/Interfacer/ImportException';
import ExportException from 'Logic/Exception/Interfacer/ExportException';
import NotDefinedModelException from 'Logic/Exception/Model/NotDefinedModelException';
import UnexpectedModelException from 'Logic/Exception/Model/UnexpectedModelException';
import UndefinedPropertyException from 'Logic/Exception/Model/UndefinedPropertyException';
import NoIdPropertyException from 'Logic/Exception/Model/NoIdPropertyException';
import AbstractObjectExportException from 'Logic/Exception/Interfacer/AbstractObjectExportException';
import DuplicatedIdException from 'Logic/Exception/Interfacer/DuplicatedIdException';
import ContextIdException from 'Logic/Exception/Interfacer/ContextIdException';
import ObjectLoopException from 'Logic/Exception/Interfacer/ObjectLoopException';
import MissingIdForeignValueException from 'Logic/Exception/Value/MissingIdForeignValueException';
import InvalidCompositeIdException from 'Logic/Exception/Value/InvalidCompositeIdException';
import ArgumentException from 'Logic/Exception/ArgumentException';
import UnknownServerException from 'Logic/Exception/HTTP/UnknownServerException';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

class Model extends ModelComplex {

	/** @type {string} */
	#modelName;

	/** @type {boolean} */
	#isLoaded = false;

	/** @type {boolean} */
	#isLoading = false;

	/**
	 * list of parent models (current model extends these models).
	 * Comhon inheriance manage multiple inheritance so it may contain several models.
	 * first parent model (at index 0) is called main parent model.
	 *
	 * @var {Model[]}
	 */
	#parents = [];

	/** @type {Model} */
	#sharedIdModel = null;

	/** @type {boolean} */
	#isMain = false;

	/** @type {boolean} */
	#isAbstract = false;

	/** @type {boolean} */
	#isOptionsLoaded = false;

	/** @type {ComhonObject} */
	#options = null;

	/** @type {Object} */
	#propertyIndexByName = new Map();

	/** @type {Property[]} */
	#properties   = [];

	/** @type {Property[]} */
	#idProperties = [];

	/** @type {AggregationProperty[]} */
	#aggregations = [];

	/** @type {Property[]} */
	#publicProperties  = [];

	/** @type {Property[]} */
	#propertiesWithDefaultValues = [];

	/** @type {Property[]} */
	#complexProperties = [];

	/** @type {Property[]} */
	#dateTimeProperties = [];

	/** @type {Property[]} */
	#requiredProperties = [];

	/** @type {Property[]} */
	#dependsProperties = [];

	/** @type {string[][]} */
	#conflicts = new Map();

	/** @type Property */
	#uniqueIdProperty = null;

	/** @type {boolean} */
	#hasPrivateIdProperty = false;

	#manifestParser = null;

	/**
	 * the generated promise when load model for the first time
	 * value is not null only during model loading
	 *
	 * @type {Promise}
	 */
	#promiseModel = null;

	/**
	 * the generated promise when load model for the first time
	 * value is not null only during model loading
	 *
	 * @type {Promise}
	 */
	#promiseOptions = null;

	/**
	 * don't instanciate a model by yourself because it take time.
	 * to get a model instance use singleton ModelManager.
	 *
	 * @param {string} modelName
	 */
	constructor(modelName) {
		super();
		this.#modelName = modelName;
		if (this.constructor === Model) {
			ModelManager.getInstance().addInstanceModel(this);
		} else {
			// ModelRoot
			this.#isLoaded = true;
		}
	}

	/**
	 * verify if model is loaded or not
	 *
	 * @returns {boolean}
	 */
	isLoaded() {
		return this.#isLoaded;
	}

	/**
	 * load model
	 *
	 * parse related manifest, fill model with needed inofmrations
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async load() {
		if (this.#isLoaded) {
			return;
		}
		if (this.#isLoading) {
			await this.#promiseModel;
			return;
		}
		let localModels = null;
		try {
			this.#promiseModel = new Promise(async (resolve, reject) => {
				try {
					this.#isLoading = true;
					if (this.#manifestParser === null) {
						localModels = await ModelManager.getInstance().addManifestParser(this);
						if (this.#manifestParser === null) {
							throw new NotDefinedModelException(this.getName());
						}
					}
					const result = await ModelManager.getInstance().getProperties(this, this.#manifestParser);
					this.#isMain = result[ModelManager.IS_MAIN_MODEL];
					this.#parents = result[ModelManager.PARENT_MODELS];
					this.#sharedIdModel = result[ModelManager.SHARED_ID_MODEL];
					this._setProperties(result[ModelManager.PROPERTIES]);
					this.#isAbstract = result[ModelManager.IS_ABSTRACT];

					for (const properties of result[ModelManager.CONFLICTS]) {
						for (let i = 0; i < properties.length; i++) {
							if (!this.#conflicts.has(properties[i])) {
								this.#conflicts.set(properties[i], []);
							}
							for (let j = 0; j < properties.length; j++) {
								if (j !== i) {
									this.#conflicts.get(properties[i]).push(properties[j]);
								}
							}
						}
					}

					for (const propertyNameAndConflicts of this.#conflicts) {
						Object.freeze(propertyNameAndConflicts[1]);
					}
					Object.freeze(this.#conflicts);
					Object.freeze(this.#parents);
					Object.freeze(this.#propertyIndexByName);
					Object.freeze(this.#properties);
					Object.freeze(this.#idProperties);
					Object.freeze(this.#aggregations);
					Object.freeze(this.#publicProperties);
					Object.freeze(this.#propertiesWithDefaultValues);
					Object.freeze(this.#complexProperties);
					Object.freeze(this.#dateTimeProperties);
					Object.freeze(this.#dependsProperties);
					Object.freeze(this.#requiredProperties);

					this.#isLoaded  = true;
					this.#isLoading = false;
					this.#manifestParser = null;
					resolve();
				} catch (e) {
					reject(e);
				}
			});
			await this.#promiseModel;
			this.#promiseModel = null;
		} catch (e) {
			// reinitialize attributes if any exception
			this.#isLoading = false;
			this.#parents = [];
			this.#propertyIndexByName = new Map();
			this.#properties   = [];
			this.#idProperties = [];
			this.#aggregations = [];
			this.#publicProperties  = [];
			this.#propertiesWithDefaultValues = [];
			this.#complexProperties = [];
			this.#dateTimeProperties = [];
			this.#dependsProperties = [];
			this.#conflicts = [];
			this.#requiredProperties = [];
			this.#uniqueIdProperty = null;
			this.#hasPrivateIdProperty = false;
			this.#manifestParser = null;

			if (localModels !== null) {
				for (const localModel of localModels) {
					localModel.#manifestParser = null;
				}
			}

			throw e;
		}
	}

	/**
	 * set manifest parser to populate model attributes.
	 * should be called only during model loading.
	 *
	 * @param {ManifestParser} manifestParser
	 * @throws ComhonException
	 */
	setManifestParser(manifestParser) {
		if (this.#manifestParser !== null) {
			throw new ComhonException('error during model \''+this.#modelName+'\' loading');
		}
		this.#manifestParser = manifestParser;
	}

	/**
	 * verify if model has a manifest parser set.
	 * should be called only during model loading.
	 *
	 * @returns {boolean}
	 */
	hasManifestParser() {
		return this.#manifestParser !== null;
	}

	/**
	 * set differents properties
	 *
	 * @param {Property[]} properties
	 */
	_setProperties(properties) {
		let publicIdProperties = [];
		let property;
		let i = 0;

		for (let propertyName in properties) {
			if (!properties.hasOwnProperty(propertyName)) {
				continue;
			}
			property = properties[propertyName];
			if (property.isId()) {
				this.#idProperties.push(property);
				if (!property.isPrivate()) {
					publicIdProperties.push(property);
				}
			}
			if (property.hasDefaultValue()) {
				this.#propertiesWithDefaultValues.push(property);
			} else if (property.isAggregation()) {
				this.#aggregations.push(property);
			}
			if (!property.isPrivate()) {
				this.#publicProperties.push(property);
			}
			if (property.isComplex()) {
				this.#complexProperties.push(property);
			}
			if (property.hasModelDateTime()) {
				this.#dateTimeProperties.push(property);
			}
			if (property.isRequired()) {
				this.#requiredProperties.push(property);
			}
			if (property.hasDependencies()) {
				this.#dependsProperties.push(property);
			}
			this.#propertyIndexByName.set(propertyName, i);
			this.#properties.push(property);
			i++;
		}
		if (this.#idProperties.length === 1) {
			this.#uniqueIdProperty = this.#idProperties[0];
		}
		if (this.#idProperties.length !== publicIdProperties.length) {
			this.#hasPrivateIdProperty = true;
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::getObjectInstance()
	 * @returns {ComhonObject}
	 */
	getObjectInstance(isloaded = true) {
		return new ComhonObject(this, isloaded);
	}

	/**
	 * verify if model is abstract.
	 * object with abstract model may be instanciated but cannot be set as loaded and cannot be interfaced
	 *
	 * @returns {boolean}
	 */
	isAbstract() {
		return this.#isAbstract;
	}

	/**
	 * get model that share id with current model.
	 * if a model is return it is inevitably a parent of current model.
	 * it may be the direct parent or the parent of parent, etc...
	 *
	 * @returns {Model|void} null if there is no parent model that share id with current model.
	 */
	getSharedIdModel() {
		return this.#sharedIdModel;
	}

	/**
	 * get parent models. Comhon inheriance manage multiple inheritance so it may return several models.
	 *
	 * @returns {Model[]} if current model doesn't extend from any models, an empty array is returned.
	 */
	getParents() {
		return this.#parents;
	}

	/**
	 * get parent model at specified index (default 0)
	 *
	 * @returns {Model|void} null if parent model at specified index doesn't exist
	 */
	getParent(index = 0) {
		return this.#parents[index] ? this.#parents[index] : null;
	}

	/**
	 * get first shared id parent model found. search from direct parent to last parent.
	 *
	 * @returns {Model|void} null if no parent model matches
	 */
	getFirstSharedIdParentMatch() {
		return this.getSharedIdParentMatch(true);
	}

	/**
	 * get last shared id parent model found. search from direct parent to last parent.
	 *
	 * @returns {Model|void} null if no parent model matches
	 */
	getLastSharedIdParentMatch() {
		return this.getSharedIdParentMatch(false);
	}

	/**
	 * get first or last shared id parent model found. search from direct parent two last parent.
	 *
	 * @param {boolean} first if true stop at first parent match otherwise coninue to last parent match
	 * @returns {Model|void} null if no parent model matches
	 */
	getSharedIdParentMatch(first) {
		let model = this;
		let parentMatch = null;
		const shareIdModel = ObjectCollection.getModelKey(this);
		while (model.getParent() !== null) {
			model = model.getParent();
			if (ObjectCollection.getModelKey(model) !== shareIdModel) {
				continue;
			}
			parentMatch = model;
			if (first) {
				break;
			}
		}
		return parentMatch;
	}

	/**
	 * verify if model extends from at least another one
	 *
	 * @returns {boolean}
	 */
	hasParent() {
		return this.#parents.length > 0;
	}

	/**
	 * verify if current model inherit from specified model
	 *
	 * @param {Model} model
	 * @returns {boolean}
	 */
	isInheritedFrom(model) {
		if (!this.isLoaded()) {
			throw new ComhonException('current model is not loaded, cannot verify if current model is inherited from given model');
		}
		let isInherited = false;

		for (const parent of this.getParents()) {
			isInherited = model === parent;
			if (!isInherited) {
				isInherited = parent.isInheritedFrom(model);
			}
			if (isInherited) {
				break;
			}
		}
		return isInherited;
	}

	/**
	 * get model name
	 *
	 * @returns {string}
	 */
	getName() {
		return this.#modelName;
	}

	/**
	 * get namespace of model
	 *
	 * @returns {string}
	 */
	getNameSpace() {
		const name = this.getName();
		const pos = name.lastIndexOf('\\');

		return (pos !== -1) ? name.substr(0, pos + 1) : '';
	}

	/**
	 * get short name of model (name without namespace)
	 *
	 * @returns {string}
	 */
	getShortName() {
		const name = this.getName();
		const pos = name.lastIndexOf('\\');

		return (pos !== -1) ? name.substr(pos + 1) : name;
	}

	/**
	 * verify if model is loading or not
	 *
	 * @returns {boolean}
	 */
	isLoading() {
		return this.#isLoading;
	}

	/**
	 * get model properties
	 *
	 * @returns {Property[]}
	 */
	getProperties() {
		return this.#properties;
	}

	/**
	 * get model properties according Private/Public context
	 *
	 * @param {boolean} isPrivate
	 * @returns {Property[]}
	 */
	_getContextProperties(isPrivate) {
		return isPrivate ? this.#properties : this.#publicProperties;
	}

	/**
	 * get model complex properties i.e. properties with model different than SimpleModel
	 *
	 * @returns {Property[]}
	 */
	getComplexProperties() {
		return this.#complexProperties;
	}

	/**
	 * get model properties with dateTime model
	 *
	 * @returns {Property[]}
	 */
	getDateTimeProperties() {
		return this.#dateTimeProperties;
	}

	/**
	 * get model public properties
	 *
	 * @returns {Property[]}
	 */
	getPublicProperties() {
		return this.#publicProperties;
	}

	/**
	 * get model properties names
	 *
	 * @returns {string[]}
	 */
	getPropertiesNames() {
		const propertiesNames = [];
		for (const property of this.#properties) {
			propertiesNames.push(property.getName());
		}
		return propertiesNames;
	}

	/**
	 * get property according specified name
	 *
	 * @param {string} propertyName
	 * @param {boolean} throwException if true, throw an exception if property doesn't exist
	 * @throws {UndefinedPropertyException}
	 * @returns {Property|void}
	 *     null if property with specified name doesn't exist
	 */
	getProperty(propertyName, throwException = false) {
		if (this.hasProperty(propertyName)) {
			return this.#properties[this.#propertyIndexByName.get(propertyName)];
		}
		else if (throwException) {
			throw new UndefinedPropertyException(this, propertyName);
		}
		return null;
	}

	/**
	 * get id property according specified name
	 *
	 * @param {string} propertyName
	 * @param {boolean} throwException
	 * @throws {UndefinedPropertyException}
	 * @returns {Property|void} null if property with specified name doesn't exist or is not an id property
	 */
	getIdProperty(propertyName, throwException = false) {
		const property = this.getProperty(propertyName, throwException);
		if (property !== null && property.isId()) {
			return property;
		}
		else if (throwException) {
			throw new UndefinedPropertyException(this, propertyName);
		}
		return null;
	}

	/**
	 * verify if model has property with specified name
	 *
	 * @param {string} propertyName
	 * @returns {boolean}
	 */
	hasProperty(propertyName) {
		return this.#propertyIndexByName.has(propertyName);
	}

	/**
	 * verify if model has id property with specified name
	 *
	 * @param {string} propertyName
	 * @returns {boolean}
	 */
	hasIdProperty(propertyName) {
		return this.getIdProperty(propertyName) !== null;
	}

	/**
	 * get id properties
	 *
	 * @returns {Property[]}
	 */
	getIdProperties() {
		return this.#idProperties;
	}

	/**
	 * get id property if there is one and only one id property
	 *
	 * @returns {Property|void}
	 *            null if there is no id property or there are several id properties
	 */
	getUniqueIdProperty() {
		return this.#uniqueIdProperty;
	}

	/**
	 * verify if there is one and only one id property
	 *
	 * @returns {boolean}
	 */
	hasUniqueIdProperty() {
		return this.#uniqueIdProperty !== null;
	}

	/**
	 * verify if model has at least one Private id property
	 *
	 * @returns {boolean}
	 */
	hasPrivateIdProperty() {
		return this.#hasPrivateIdProperty;
	}

	/**
	 * verify if model has at least one id property
	 *
	 * @returns {boolean}
	 */
	hasIdProperties() {
		return this.#idProperties.length > 0;
	}

	/**
	 * get properties with default value
	 *
	 * @returns {Property[]}
	 */
	getPropertiesWithDefaultValues() {
		return this.#propertiesWithDefaultValues;
	}

	/**
	 * get aggregation proprties
	 *
	 * @returns {AggregationProperty[]}
	 */
	getAggregationProperties() {
		return this.#aggregations;
	}

	/**
	 * get required properties
	 *
	 * @returns {Property[]}
	 */
	getRequiredProperties() {
		return this.#requiredProperties;
	}

	/**
	 * verify if specified property has conflits with other properties.
	 * a property has conflict with other properties if property value MUST NOT be set when other properties values are set.
	 *
	 * @param {string} propertyName name of property
	 * @returns {boolean}
	 */
	hasPropertyConflicts(propertyName) {
		return this.#conflicts.has(propertyName);
	}

	/**
	 * get properties names that have conflicts with specified property.
	 * a property has conflict with other properties if property value MUST NOT be set when other properties values are set.
	 *
	 * @param {string} propertyName name of property
	 * @returns {string[]}
	 */
	getPropertyConflicts(propertyName) {
		return this.#conflicts.has(propertyName) ? this.#conflicts.get(propertyName) : [];
	}

	/**
	 * get all conflicts.
	 * a property has conflict with other properties if property value MUST NOT be set when other properties values are set.
	 *
	 * @returns {string[]}
	 */
	getConflicts() {
		return this.#conflicts;
	}

	/**
	 * get all properties that depends on other property(ies).
	 * a property depends on other properties if property value MAY be set only if other properties values are set.
	 *
	 * @returns {Property[]}
	 */
	getDependsProperties() {
		return this.#dependsProperties;
	}

	/**
	 * verify if model is a main model
	 * if true that means comhon object with current model might be stored in MainObjectCollection
	 *
	 * @returns {boolean}
	 */
	isMain() {
		return this.#isMain;
	}

	/**
	 * load options
	 *
	 * @async
	 * @private
	 * @returns {Promise<ComhonObject>}
	 */
	async _loadOptions() {
		if (!this.#isOptionsLoaded) {
			const apiModelName = ApiModelNameManager.getApiModelName(this.#modelName) ?? this.#modelName;
			try {
				const xhr = await Requester.options(apiModelName);
				if (xhr.status !== 200) {
					throw new HTTPException(xhr);
				}
				if (xhr.responseText !== '') {
					const objectInterfacer = new ObjectInterfacer();
					const optionsModel = await ModelManager.getInstance().getInstanceModel('Comhon\\Options');
					this.#options = await optionsModel.import(objectInterfacer.fromString(xhr.responseText), objectInterfacer);
				} else {
					// simulate unique request by puting a random id '1'
					const unique = await Requester.options(apiModelName+'/1');
					this.#options = this._initOptionsMethods(xhr.getResponseHeader('Allow'), unique.getResponseHeader('Allow'));
				}
				this.#isOptionsLoaded = true;
			} catch (e) {
				// UnknownServerException may happened due to CORS that block request OPTIONS
				// that may return 404 (the exact error is not catchable)
				// (if model does't exist or is not requestable, 404 is returned on OPTIONS request)
				if (e instanceof UnknownServerException || (e instanceof HTTPException && e.getCode() === 404)) {
					this.#options = this._initOptionsMethods(null, null);
					this.#isOptionsLoaded = true;
				} else {
					throw e;
				}
			}
		}
	}

	/**
	 * load options
	 *
	 * @async
	 * @private
	 * @returns {Promise<ComhonObject>}
	 */
	async _initOptionsMethods(collectionAllowHeader, uniqueAllowHeader) {
		const collectionAllow = collectionAllowHeader === null ? [] : collectionAllowHeader.replace(/\s/g, '').split(',');
		const uniqueAllow = uniqueAllowHeader === null ? [] : uniqueAllowHeader.replace(/\s/g, '').split(',');

		const optionsModel = await ModelManager.getInstance().getInstanceModel('Comhon\\Options');
		const options = optionsModel.getObjectInstance(true);
		options.setValue('name', this.#modelName);
		const collection = await options.initValue('collection');
		const collectionAllowed = await collection.initValue('allowed_methods');
		for (const allow of collectionAllow) {
			collectionAllowed.pushValue(allow);
		}
		const unique = await options.initValue('unique');
		const uniqueAllowed = await unique.initValue('allowed_methods');
		for (const allow of uniqueAllow) {
			uniqueAllowed.pushValue(allow);
		}

		return options;
	}

	/**
	 * get options
	 *
	 * @async
	 * @returns {Promise<ComhonObject>}
	 */
	async getOptions() {
		if (!this.#isOptionsLoaded) {
			if (this.#promiseOptions === null) {
				this.#promiseOptions = this._loadOptions();
			}
			await this.#promiseOptions;
			this.#promiseOptions = null;
		}
		return this.#options;
	}

	/**
	 * encode multiple ids in json format
	 *
	 * @param {array} idValues
	 * @returns {string}
	 */
	static encodeId(idValues) {
		return idValues.length > 0 ? null : JSON.stringify(idValues);
	}

	/**
	 * decode multiple ids from json format
	 *
	 * @param {string} id
	 * @returns {Array.}
	 */
	decodeId(id) {
		const decodedId = JSON.parse(id);
		if (!Array.isArray(decodedId) || (this.getIdProperties().length !== decodedId.length)) {
			throw new InvalidCompositeIdException(id);
		}
		return decodedId;
	}

	/**
	 * verify if composite id has all id values not null and are not empty string.
	 * do not verify values types.
	 *
	 * @param {string} id
	 * @returns {boolean}
	 */
	isCompleteId(id) {
		if (this.hasUniqueIdProperty()) {
			return true;
		}
		const decodedId = this.decodeId(id);
		for (let i = 0; i < decodedId.length; i++) {
			if ((decodedId[i] === null) || decodedId[i] === '') {
				return false;
			}
		}
		return true;
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
	 * load comhon object
	 *
	 * @async
	 * @param {string|integer} id
	 * @param {string[]} propertiesFilter
	 * @param {boolean} forceLoad if object already exists and is already loaded, force to reload object
	 * @throws {ComhonException}
	 * @returns {Promise<ComhonObject|void>} null if load is unsuccessfull
	 */
	async loadObject(id, propertiesFilter = null, forceLoad = false) {
		if (id === null) {
			return null;
		}
		if (!this.hasIdProperties()) {
			throw new NoIdPropertyException(this);
		}
		let object = MainObjectCollection.getObject(id, this);
		let newObject;

		if (object === null) {
			object = this._buildObjectFromId(id, false, false);
			newObject = true;
		} else if (object.isLoaded() && !forceLoad) {
			return object;
		} else {
			newObject = false;
		}

		try {
			const success = await object.load(propertiesFilter, forceLoad);
			if (!success && newObject) {
				object.reset(); // remove object from main object collection if needed
			}
			return success ? object : null;
		} catch (e) {
			if (newObject) {
				object.reset(); // remove object from main object collection if needed
			}
			throw e;
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_export()
	 */
	_export(object, nodeName, interfacer, isFirstLevel, objectCollectionInterfacer, nullNodes, oids, isolate = false) {
		/** @var {ComhonObject} object */
		if (object === null) {
			return null;
		}
		if (object.getModel().isAbstract()) {
			throw new AbstractObjectExportException(object.getModel().getName());
		}
		if (!isFirstLevel || interfacer.mustValidate()) {
			object.validate();
		}

		const node              = interfacer.createNode(nodeName);
		const isPrivate         = interfacer.isPrivateContext();
		const onlyUpdatedValues = isFirstLevel && interfacer.hasToExportOnlyUpdatedValues();
		const propertiesFilter  = isFirstLevel ? interfacer.getPropertiesFilter() : null;
		let originalCollection, exportedValue;

		if (object.getOid() in oids) {
			if (oids[object.getOid()] > 0) {
				throw new ObjectLoopException();
			}
		} else {
			oids[object.getOid()] = 0;
		}
		oids[object.getOid()]++;

		if (object.getModel().hasIdProperties()) {
			if (objectCollectionInterfacer.hasNewObject(object.getId(), object.getModel())) {
				throw new DuplicatedIdException(object.getId());
			}
			objectCollectionInterfacer.addObject(object, false);
		}
		if (isolate) {
			originalCollection = objectCollectionInterfacer;
			objectCollectionInterfacer = new ObjectCollectionInterfacer();
		}

		let propertyName, value;
		for ([propertyName, value] of object) {
			try {
				const property = object.getModel().getProperty(propertyName);
				if (
					property.isInterfaceable(isPrivate)
					&& (!onlyUpdatedValues || property.isId() || object.isUpdatedValue(propertyName))
					&& ((propertiesFilter === null) || (propertiesFilter.indexOf(propertyName) !== -1))
				) {
					if ((value === null) && (nullNodes !== null)) {
						// if nullNodes is not null interfacer must be a xml interfacer
						exportedValue = interfacer.createNode(propertyName);
						nullNodes.push(exportedValue);
					} else {
						exportedValue = property.getLoadedModel()._export(value, propertyName, interfacer, false, objectCollectionInterfacer, nullNodes, oids, property.isIsolated());
					}
					interfacer.setValue(node, exportedValue, propertyName, property.isInterfacedAsNodeXml());
				}
			} catch (e) {
				throw new ExportException(e, propertyName);
			}
		}
		if (object.getModel() !== this) {
			interfacer.setValue(node, object.getModel().getName(), Interfacer.INHERITANCE_KEY);
		}
		if (isolate) {
			if (interfacer.hasToVerifyReferences()) {
				this._verifyReferences(object, objectCollectionInterfacer);
			}
			objectCollectionInterfacer = originalCollection;
			objectCollectionInterfacer.addObject(object, false);
		}
		oids[object.getOid()]--;
		return node;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_exportId()
	 */
	_exportId(object, nodeName, interfacer, objectCollectionInterfacer, nullNodes) {
		const model = object.getModel();
		let exportedId;
		if (!model.hasIdProperties()) {
			throw new ComhonException(`cannot export id, actual model '${model.getName()}' doesn't have id`);
		}
		if (!interfacer.isPrivateContext() && model.hasPrivateIdProperty()) {
			throw new ContextIdException();
		}
		objectCollectionInterfacer.addObject(object, true);
		// for object model different than current model but that share id with current model
		// we may export only id whitout inheritance
		// but for main model we keep inheritance because it can be a usefull information
		if (model === this || (!model.isMain() && ObjectCollection.getModelKey(this) === ObjectCollection.getModelKey(model))) {
			exportedId = Model._toInterfacedId(object);
		} else {
			if (!model.isInheritedFrom(this)) {
				throw new UnexpectedModelException(this, model);
			}
			exportedId = interfacer.createNode(nodeName);
			interfacer.setValue(exportedId, Model._toInterfacedId(object), Interfacer.COMPLEX_ID_KEY);
			interfacer.setValue(exportedId, model.getName(), Interfacer.INHERITANCE_KEY);
		}

		return exportedId;
	}

	/**
	 * get inherited model name from interfaced object
	 *
	 * @private
	 * @param {*} interfacedObject
	 * @param Interfacer interfacer
	 * @returns {string|void}
	 */
	_getInheritedModelName(interfacedObject, interfacer) {
		return interfacer.getValue(interfacedObject, Interfacer.INHERITANCE_KEY);
	}

	/**
	 * get inherited model
	 *
	 * @async
	 * @private
	 * @param {string} inheritanceModelName
	 * @returns {Promise<Model>}
	 */
	async _getInheritedModel(inheritanceModelName) {
		const model = await ModelManager.getInstance().getInstanceModel(inheritanceModelName);
		if (model !== this && !model.isInheritedFrom(this)) {
			throw new UnexpectedModelException(this, model);
		}
		return model;
	}

	/**
	 * get id from interfaced object
	 *
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @returns {*}
	 */
	getIdFromInterfacedObject(interfacedObject, interfacer, isFirstLevel) {
		const isPrivate = interfacer.isPrivateContext();
		let propertyName;
		if (this.#uniqueIdProperty !== null) {
			if (!this.#uniqueIdProperty.isInterfaceable(isPrivate)) {
				return null;
			}
			propertyName = this.#uniqueIdProperty.getName();
			const id = interfacer.getValue(interfacedObject, propertyName, this.#uniqueIdProperty.isInterfacedAsNodeXml());
			return this.#uniqueIdProperty.getLoadedModel().importValue(id, interfacer);
		}
		const idValues = [];
		let hasIds = false;

		for (const idProperty of this.getIdProperties()) {
			if (idProperty.isInterfaceable(isPrivate)) {
				propertyName = idProperty.getName();
				if (interfacer.hasValue(interfacedObject, propertyName, idProperty.isInterfacedAsNodeXml())) {
					hasIds = true;
				}
				const idValue = interfacer.getValue(interfacedObject, propertyName, idProperty.isInterfacedAsNodeXml());
				idValues.push(idProperty.getLoadedModel().importValue(idValue, interfacer));
			} else {
				idValues.push(null);
			}
		}
		return hasIds ? Model.encodeId(idValues) : null;
	}

	/**
	 * get comhon object instance according model and interfaced object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @returns {Promise<ComhonObject>}
	 */
	async _getOrCreateObjectInstanceFromInterfacedObject(interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer) {
		const inheritance = this._getInheritedModelName(interfacedObject, interfacer);
		const model = inheritance === null ? this : await this._getInheritedModel(inheritance);
		const id = model.getIdFromInterfacedObject(interfacedObject, interfacer, isFirstLevel);

		return model._getOrCreateObjectInstance(id, interfacer, isFirstLevel, false, objectCollectionInterfacer);
	}

	/**
	 * get or create an instance of AbstractComhonObject
	 *
	 * @param {integer}|string id
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {boolean} isForeign
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @throws {ComhonException}
	 * @returns {AbstractComhonObject}
	 */
	_getOrCreateObjectInstance(id, interfacer, isFirstLevel, isForeign, objectCollectionInterfacer) {
		let object;
		if ((id === null) || !this.hasIdProperties()) {
			object = this.getObjectInstance(false);
		}
		else {
			const model = ObjectCollection.getModelKey(this);
			object = objectCollectionInterfacer.getObject(id, model);
			if ((object !== null) && !isForeign && objectCollectionInterfacer.hasNewObject(id, model)) {
				throw new DuplicatedIdException(id);
			}
			if (this.#isMain && (object === null)) {
				object = MainObjectCollection.getObject(id, this);
			}
			if (object === null) {
				object = this._buildObjectFromId(id, false, interfacer.hasToFlagValuesAsUpdated());
				objectCollectionInterfacer.addObject(object, isForeign);
			}
			else {
				if (this.isInheritedFrom(object.getModel()) && ObjectCollection.getModelKey(this) === ObjectCollection.getModelKey(object.getModel())) {
					object.cast(this);
				}
				if (isFirstLevel) {
					if (interfacer.getMergeType() === Interfacer.OVERWRITE) {
						const isLoaded = object.isLoaded();
						object.reset(false);
						object.setIsLoaded(isLoaded);
					}
				} else if (!isForeign) {
					object.reset(false);
				}
				objectCollectionInterfacer.addObject(object, isForeign);
			}
		}
		return object;
	}

	/**
	 * import interfaced object
	 *
	 * build comhon object with values from interfaced object
	 * import may create an object or update an existing object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @throws {ComhonException}
	 * @returns {Promise<ComhonObject>}
	 */
	async import(interfacedObject, interfacer) {
		try {
			return this._importRoot(interfacedObject, interfacer);
		}
		catch (e) {
			throw new ImportException(e);
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_importRoot()
	 * @returns {ComhonObject}
	 */
	async _importRoot(interfacedObject, interfacer, rootObject = null, isolate = false) {
		if (!interfacer.isNodeValue(interfacedObject)) {
			if ((interfacer instanceof ObjectInterfacer) && Array.isArray(interfacedObject) && (interfacedObject.length === 0)) {
				interfacedObject = {};
			} else {
				throw new UnexpectedValueTypeException(interfacedObject, interfacer.getNodeClasses().join(' or '));
			}
		}

		return super._importRoot(interfacedObject, interfacer, rootObject, isolate);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_getRootObject()
	 */
	async _getRootObject(interfacedObject, interfacer) {
		return this._getOrCreateObjectInstanceFromInterfacedObject(
			interfacedObject,
			interfacer,
			true,
			new ObjectCollectionInterfacer()
		);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_initObjectCollectionInterfacer()
	 */
	_initObjectCollectionInterfacer(object, mergeType) {
		const objectCollectionInterfacer = mergeType === Interfacer.MERGE
			? new ObjectCollectionInterfacer(object)
			: new ObjectCollectionInterfacer();

		objectCollectionInterfacer.addStartObject(object, false);
		objectCollectionInterfacer.addObject(object, false);

		return objectCollectionInterfacer;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::_import()
	 */
	async _import(interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer, isolate = false) {
		if (interfacer.isNullValue(interfacedObject)) {
			return null;
		}
		if (!interfacer.isNodeValue(interfacedObject)) {
			if ((interfacer instanceof ObjectInterfacer) && Array.isArray(interfacedObject) && (interfacedObject.length === 0)) {
				interfacedObject = {};
			} else {
				throw new UnexpectedValueTypeException(interfacedObject, interfacer.getNodeClasses().join(' or '));
			}
		}
		const object = await this._getOrCreateObjectInstanceFromInterfacedObject(interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer);

		if (isolate) {
			objectCollectionInterfacer = isFirstLevel
				? new ObjectCollectionInterfacer(object)
				: new ObjectCollectionInterfacer();
			objectCollectionInterfacer.addStartObject(object, false);
			objectCollectionInterfacer.addObject(object, false);
		}
		await this._fillObject(object, interfacedObject, interfacer, isFirstLevel, objectCollectionInterfacer);
		if (isolate) {
			if (interfacer.hasToVerifyReferences()) {
				this._verifyReferences(object, objectCollectionInterfacer);
			}
		}
		return object;
	}

	/**
	 * fill comhon object with values from interfaced object
	 *
	 * @async
	 * @param {AbstractComhonObject} object
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @throws {ComhonException}
	 * @returns {Promise<void>}
	 */
	async fillObject(object, interfacedObject, interfacer) {
		this.verifValue(object);

		try {
			const inheritance = this._getInheritedModelName(interfacedObject, interfacer, true);
			if (inheritance !== null) {
				const newModel = await ModelManager.getInstance().getInstanceModel(inheritance);
				object.cast(newModel);
			}
			const model = object.getModel();
			model._verifIdBeforeFillObject(object, model.getIdFromInterfacedObject(interfacedObject, interfacer, true), interfacer.hasToFlagValuesAsUpdated());

			const imported = await model._importRoot(interfacedObject, interfacer, object);
			if (imported !== object) {
				throw new ComhonException('invalid object instance');
			}
		}
		catch (e) {
			if (e instanceof ComhonException) {
				throw new ImportException(e);
			} else {
				throw e;
			}
		}
	}

	/**
	 * verify comhon object to fill
	 *
	 * check if has right model and right id
	 *
	 * @private
	 * @param {ComhonObject} object
	 * @param {*} id
	 * @param {boolean} flagAsUpdated
	 * @throws {ComhonException}
	 */
	_verifIdBeforeFillObject(object, id, flagAsUpdated) {
		if (object.getModel() !== this) {
			throw new UnexpectedModelException(this, object.getModel());
		}
		if (!this.hasIdProperties()) {
			return ;
		}
		if (!object.hasCompleteId()) {
			this._fillObjectwithId(object, id, flagAsUpdated);
		}
		if (!object.hasCompleteId()) {
			return ;
		}
		if (object.getId() !== id) {
			const messageId = id === null ? 'null' : id;
			throw new ComhonException(`id must be the same as imported value id : ${object.getId()} !== ${messageId}`);
		}
	}

	/**
	 * fill comhon object with values from interfaced object
	 *
	 * {@inheritDoc}
	 * @see {ModelComplex}::_fillObject()
	 */
	async _fillObject(
		object,
		interfacedObject,
		interfacer,
		isFirstLevel,
		objectCollectionInterfacer,
		isolate = false
	) {
		if (!(object instanceof ComhonObject)) {
			throw new ArgumentException(object, 'ComhonObject', 1);
		}
		const model = object.getModel();
		if (!object.isA(this)) {
			throw new UnexpectedModelException(this, model);
		}
		let unchangedValues;
		let processUnchangedValues = isFirstLevel && interfacer.hasToVerifyReferences()
			&& interfacer.getMergeType() === Interfacer.MERGE;
		if (processUnchangedValues) {
			unchangedValues = object.getObjectValues();
			if (unchangedValues.size === 0) {
				processUnchangedValues = false;
			}
		}

		const isPrivate         = interfacer.isPrivateContext();
		const flagAsUpdated     = interfacer.hasToFlagValuesAsUpdated();
		const properties        = model._getContextProperties(isPrivate);
		const nullNodes         = interfacer instanceof XMLInterfacer ? interfacer.getNullNodes(interfacedObject) : null;
		let value;

		for (const property of properties) {
			let propertyName;
			try {
				const propertyName = property.getName();
				if (property.isInterfaceable(isPrivate)) {
					if (interfacer.hasValue(interfacedObject, propertyName, property.isInterfacedAsNodeXml())) {
						const interfacedValue = interfacer.getValue(interfacedObject, propertyName, property.isInterfacedAsNodeXml());
						if (interfacer.isNullValue(interfacedValue)) {
							value = null;
						} else {
							const propertyModel = await property.getModel();
							value = await propertyModel._import(
								interfacedValue,
								interfacer,
								propertyModel._isNextLevelFirstLevel(isFirstLevel),
								objectCollectionInterfacer,
								property.isIsolated()
							);
						}
						object.setValue(propertyName, value, flagAsUpdated);
						if (processUnchangedValues) {
							unchangedValues.delete(propertyName);
						}
					} else if (!property.isInterfacedAsNodeXml() && (nullNodes !== null) && (nullNodes.indexOf(propertyName) !== -1)) {
						object.setValue(propertyName, null, flagAsUpdated);
						if (processUnchangedValues) {
							unchangedValues.delete(propertyName);
						}
					}
				}
			} catch (e) {
				if (e instanceof ComhonException) {
					throw new ImportException(e, propertyName);
				} else {
					throw e;
				}
			}
		}

		if (isFirstLevel) {
			if (interfacer.hasToFlagObjectAsLoaded()) {
				object.setIsLoaded(true);
			}
			if (interfacer.mustValidate()) {
				object.validate();
			}
			if (processUnchangedValues) {
				this._processUnchangeValues(unchangedValues, objectCollectionInterfacer);
			}
		} else {
			object.setIsLoaded(true);
			object.validate();
		}
	}

	/**
	 * add unchanged values of existing objects in new object collections.
	 * that will permit to verify references at the end of inport
	 *
	 * @private
	 * @param {Map.AbstractComhonObject} unchangedValues
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 */
	_processUnchangeValues(unchangedValues, objectCollectionInterfacer) {
		for (const [name, value] of unchangedValues) {
			const propertyModel = this.getProperty(name).getLoadedModel();
			if (propertyModel instanceof ModelForeign) {
				if (propertyModel.getLoadedModel() instanceof ModelArray) {
					for (const element of ModelArray.getOneDimensionalValues(value, true)) {
						objectCollectionInterfacer.addObject(element, true);
					}
				} else {
					objectCollectionInterfacer.addObject(value, true);
				}
			} else {
				ObjectCollection.build(value, true, false, objectCollectionInterfacer.getNewObjectCollection());
			}
		}
	}

	/**
	 * create or get comhon object according interfaced id
	 *
	 * @async
	 * @param {*} interfacedId
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @returns {Promise<ComhonObject>}
	 */
	async _importId(interfacedId, interfacer, isFirstLevel, objectCollectionInterfacer) {
		let id, model;
		if (interfacer.isComplexInterfacedId(interfacedId)) {
			if (!interfacer.hasValue(interfacedId, Interfacer.COMPLEX_ID_KEY) || !interfacer.hasValue(interfacedId, Interfacer.INHERITANCE_KEY)) {
				throw new ComhonException('object id must have property \''+Interfacer.COMPLEX_ID_KEY+'\' and \''+Interfacer.INHERITANCE_KEY+'\'');
			}
			id = interfacer.getValue(interfacedId, Interfacer.COMPLEX_ID_KEY);
			const inheritance = interfacer.getValue(interfacedId, Interfacer.INHERITANCE_KEY);
			model = await this._getInheritedModel(inheritance);
		}
		else {
			id = interfacedId;
			model = this;
			if (interfacer instanceof XMLInterfacer && id instanceof Element) {
				id = interfacer.extractNodeText(id);
			}
		}
		if (!model.hasIdProperties()) {
			throw new ComhonException(`cannot import id, actual model '${model.getName()}' doesn't have id`);
		}
		if (!interfacer.isPrivateContext() && model.hasPrivateIdProperty()) {
			throw new ContextIdException();
		}
		if (id === null) {
			return null;
		}
		if (
			model.hasUniqueIdProperty()
			&& (
				(isFirstLevel && interfacer.isStringifiedValues())
				|| interfacer instanceof XMLInterfacer
			)
		) {
			id = model.getUniqueIdProperty().getLoadedModel().importValue(id, interfacer);
		}
		if ((typeof id === 'object' && id !== null) || id === '') {
			id = (typeof id === 'object' && id !== null) ? JSON.stringify(id) : id;
			throw new ComhonException(`malformed id '${id}' for model '${model.modelName}'`);
		}

		return model._getOrCreateObjectInstance(id, interfacer, false, true, objectCollectionInterfacer);
	}

	/**
	 * build interface id from comhon object
	 *
	 * @private
	 * @param {ComhonObject} object
	 * @throws {ComhonException}
	 * @returns {integer|string}
	 */
	 static _toInterfacedId(object) {
		if (!object.hasCompleteId()) {
			throw new MissingIdForeignValueException();
		}
		return object.getId();
	}

	/**
	 * create comhon object and fill it with id
	 *
	 * @param {*} id
	 * @param {boolean} isloaded
	 * @param {boolean} flagAsUpdated
	 * @returns {ComhonObject}
	 */
	_buildObjectFromId(id, isloaded, flagAsUpdated) {
		return this._fillObjectwithId(this.getObjectInstance(isloaded), id, flagAsUpdated);
	}

	/**
	 * fill comhon object with id
	 *
	 * @param {ComhonObject} object
	 * @param {*} id
	 * @param {boolean} flagAsUpdated
	 * @throws {ComhonException}
	 * @returns {ComhonObject}
	 */
	_fillObjectwithId(object, id, flagAsUpdated) {
		if (object.getModel() !== this) {
			throw new UnexpectedModelException(this, object.getModel());
		}
		if (id !== null) {
			object.setId(id, flagAsUpdated);
		}
		return object;
	}

	/**
	 * verify if value is correct according current model
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	verifValue(value) {
		if (!(value instanceof ComhonObject) || !value.isA(this)) {
			throw new UnexpectedValueTypeException(value, `ComhonObject(${this.getName()})`);
		}
		return true;
	}

}

class ModelRoot extends Model {

	/**
	 * don't instanciate a model by yourself because it take time.
	 * to get a model instance use singleton ModelManager.
	 *
	 * @param {string} modelName
	 */
	 constructor() {
		 super('Comhon\\Root');
	 }

}

// we register some module to avoid import loop
// due to strong dependencies that make inherited class loading fail
ModuleBridge.registerModelRoot(new ModelRoot());
ModuleBridge.registerObjectFinder(ObjectFinder);

export default Model;
