/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import simpleModels from 'Logic/Model/Manager/SimpleModels';
import Model from 'Logic/Model/Model';
import Restriction from 'Logic/Model/Restriction/Restriction';
import ManifestParser from 'Logic/ManifestParser/ManifestParser';
import ManifestParserFactory from 'Logic/ManifestParser/ManifestParserFactory';
import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';
import NotDefinedModelException from 'Logic/Exception/Model/NotDefinedModelException';
import ComhonException from 'Logic/Exception/ComhonException';
import AlreadyUsedModelNameException from 'Logic/Exception/Model/AlreadyUsedModelNameException';
import NotSatisfiedRestrictionException from 'Logic/Exception/Value/NotSatisfiedRestrictionException';
import ModuleBridge from 'Logic/ModuleBridge/ModuleBridge';
import Requester from 'Logic/Requester/ComhonRequester';

class ModelManager {

	/** @type {string} */
	static get PROPERTIES() {return 'properties';};

	/** @type {string} */
	static get PARENT_MODELS() {return 'parentModels';};

	/** @type {string} */
	static get IS_MAIN_MODEL() {return 'isMainModel';};

	/** @type {string} */
	static get IS_ABSTRACT() {return 'is_abstract';};

	/** @type {string} */
	static get SHARED_ID_MODEL() {return 'shared_id_model';};

	/** @type {string} */
	static get CONFLICTS() {return 'conflicts';};

	/**
	 * @type {ModelManager}
	 */
	static #instance = null;

	/**
	 * @type {AbstractModel[]}
	 *     map that contain all main model and simple model instances
	 *     an element may be a model if model is loaded
	 *     an element may be an array that contain a non loaded model (with needed informations to load it)
	 */
	#instanceModels = {};

	/**
	 * @type {string}
	 */
	#originalModelName = null;

	/**
	 * @var {ModelRoot}
	 */
	#modelRoot = null;

	static getInstance() {
		if (ModelManager.#instance === null) {
			ModelManager.#instance = new ModelManager();
		}
		return ModelManager.#instance;
	}

	constructor() {
		for (const simpleModelName in simpleModels) {
			if (simpleModels.hasOwnProperty(simpleModelName)) {
				this.#instanceModels[simpleModelName] = simpleModels[simpleModelName];
			}
		}
		this.#modelRoot = ModuleBridge.getModelRoot();
		if (this.#modelRoot === null) {
			throw new Error(`Model root model has not been registered`);
		}
		this.#instanceModels[this.#modelRoot.getName()] = this.#modelRoot;
	}

	/**
	 * verify if specified model is instanciated (not necessary loaded)
	 *
	 * @param {string} modelName fully qualified name of wanted model
	 * @returns {boolean}
	 */
	hasInstanceModel(modelName) {
		return modelName in this.#instanceModels;
	}

	/**
	 * verify if specified model is instanciated and loaded
	 *
	 * @param {string} modelName fully qualified name of wanted model
	 * @throws {ComhonException} if model has not been registered
	 * @returns {boolean}
	 */
	hasInstanceModelLoaded(modelName) {
		return (modelName in this.#instanceModels) && this.#instanceModels[modelName].isLoaded();
	}

	/**
	 * get model instance
	 *
	 * @async
	 * @param {string} modelName fully qualified name of wanted model
	 * @returns {Promise<Model|SimpleModel>}
	 */
	async getInstanceModel(modelName) {
		const model = this._getInstanceModel(modelName);
		if (!model.isLoaded()) {
			await model.load();
		}
		return model;
	}

	/**
	 * get model instance
	 *
	 * unlike public method, retrieved model is not necessarily loaded
	 *
	 * @private
	 * @param {string} modelName fully qualified name of wanted model
	 * @throws {ComhonException}
	 * @returns {Model|SimpleModel}
	 */
	_getInstanceModel(modelName) {
		if (typeof modelName !== 'string') {
			throw new Error('first argument must be a string');
		}
		if (!(modelName in this.#instanceModels)) {
			new Model(modelName);
			// instance model must be added during model instanciation (in constructor)
			if (!(modelName in this.#instanceModels)) {
				throw new ComhonException('model not added during model instanciation');
			}
		}
		return this.#instanceModels[modelName];
	}

	/**
	 * add manifest parser to specified model
	 *
	 * @async
	 * @param {Model} model
	 * @returns {Model[]} models from local types
	 */
	async addManifestParser(model) {
		if (this.hasInstanceModelLoaded(model.getName())) {
			throw new ComhonException(model.getName() + ' model already loaded');
    }
		const manifest = await Requester.getManifest(model.getName());
		const interfacer = ManifestParser.getInterfacerInstance(manifest);
		const fullyQualifiedName = interfacer.getValue(manifest, 'name');

		/**
		 * the model that come from manifest (not necessarily same than model because model might be a model from local type)
		 * @var {Model} mainModel
		 */
		const mainModel = this._getInstanceModel(fullyQualifiedName);
		const manifestParser = ManifestParserFactory.getInstance(manifest, mainModel.getName());
		const localTypeManifestParsers = manifestParser.getLocalModelManifestParsers();

		if (mainModel !== model && !(model.getName() in localTypeManifestParsers)) {
			throw new NotDefinedModelException(model.getName());
		}

		mainModel.setManifestParser(manifestParser);
		return this._instanciateLocalModels(localTypeManifestParsers);
	}

	/**
	 * add instance model.
	 * automatically called during Model instanciation
	 *
	 * @param {Model} model
	 */
	addInstanceModel(model) {
		if (model.getName() in this.#instanceModels) {
			throw new AlreadyUsedModelNameException(model.getName());
		}
		this.#instanceModels[model.getName()] = model;
	}

	/**
	 * get properties (and optional parent model, object class) of specified model
	 *
	 * @async
	 * @param {Model} model
	 * @returns [
	 *     ModelManager.IS_MAIN_MODEL : bool
	 *     ModelManager.IS_ABSTRACT   : bool
	 *     ModelManager.PROPERTIES    : {Property[]}
	 *     ModelManager.PARENT_MODELS : {Model[]}
	 *     ModelManager.SHARED_ID_MODEL : {Model|void}
	 *     ModelManager.CONFLICTS : {String[]}
	 * ]
	 */
	async getProperties(model,manifestParser) {
		let properties = null;
		let isOriginalModel = false;

		try {
			if ((model.getName() in this.#instanceModels) && this.#instanceModels[model.getName()].isLoaded()) {
				throw new ComhonException(`function should not be called, model ${model.getName()} already loaded`);
			}
			if (this.#originalModelName === null) {
				this.#originalModelName = model.getName();
				isOriginalModel = true;
			}
			const parentModels = await this._getParentModels(model, manifestParser);

			properties = {
				[ModelManager.IS_ABSTRACT] : manifestParser.isAbstract(),
				[ModelManager.PROPERTIES] : await this._buildProperties(parentModels, model, manifestParser),
				[ModelManager.CONFLICTS] : manifestParser.getConflicts(),
			};
			properties[ModelManager.SHARED_ID_MODEL] = await this._getSharedIdModel(model, manifestParser, parentModels);
			properties[ModelManager.IS_MAIN_MODEL] = manifestParser.isMain();
			if (parentModels.length === 0) {
				parentModels.push(this.#modelRoot);
			}
			properties[ModelManager.PARENT_MODELS] = parentModels;

			if (isOriginalModel) {
				this.#originalModelName = null;
			}
		} catch (e) {
			this.#originalModelName = null;
			throw e;
		}
		return properties;
	}

	/**
	 * instanciate models according given local manifest parsers
	 *
	 * @private
	 * @param {array} localTypeManifestParsers
	 * @returns {Model[]} models from local types
	 */
	_instanciateLocalModels(localTypeManifestParsers) {
		const models = [];
		for (const modelName in localTypeManifestParsers) {
			if (!localTypeManifestParsers.hasOwnProperty(modelName)) {
				continue;
			}
			const localManifestParser = localTypeManifestParsers[modelName];
			const model = this._getInstanceModel(modelName);
			if (!model.isLoaded()) {
				if (model.hasManifestParser()) {
					throw new AlreadyUsedModelNameException(model.getName());
				}
				model.setManifestParser(localManifestParser);
			}
			models.push(model);
		}
		return models;
	}

	/**
	 * get parent models if exist
	 *
	 * @async
	 * @private
	 * @param {Model} model
	 * @param {ManifestParser} manifestParser
	 * @throws {ComhonException}
	 * @returns {Promise<Model[]>}
	 */
	async _getParentModels(model,manifestParser) {
		const parentModels = [];
		const modelNames = manifestParser.getExtends();

		if (modelNames !== null) {
			for (let modelName of modelNames) {
				if (modelName in simpleModels) {
					throw new ComhonException(`${model.getName()} cannot extends from ${modelName}`);
				}
				modelName = modelName[0] === '\\' ? modelName.substr(1) : manifestParser.getNamespace() + '\\' + modelName;

				if (this.hasInstanceModel(modelName) && this._getInstanceModel(modelName).isLoading()) {
					throw new ComhonException(`loop detected in model inheritance : ${model.getName()} and ${this.#originalModelName}`);
				}
				const parentModel = await this.getInstanceModel(modelName);
				parentModels.push(parentModel);
			}
		}

		return parentModels;
	}

	/**
	 * build model properties
	 *
	 * @async
	 * @private
	 * @param {Model[]} parentModels
	 * @param {Model} currentModel
	 * @param {ManifestParser} manifestParser
	 * @throws {ComhonException}
	 * @returns {Property[]}
	 */
	async _buildProperties(parentModels,currentModel,manifestParser) {
		/** @var {Property[]} properties */
		const properties = {};
		const propertiesWithDefault = [];
		const patternPromises = new Map();

		for (const parentModel of parentModels) {
			for (const property of parentModel.getProperties()) {
				const propertyName = property.getName();
				if ((propertyName in properties) && !properties[propertyName].isEqual(property)) {
					throw new ComhonException(
						`Multiple inheritance conflict on property "${propertyName}" `+
						`on model "${currentModel.getName()}"`
					);
				}
				properties[propertyName] = property;
			}
		}
		if (manifestParser.getCurrentPropertiesCount() > 0) {
			do {
				let modelName = manifestParser.getCurrentPropertyModelUniqueName();
				if (!(modelName in simpleModels)) {
					modelName = (modelName[0] !== '\\')
						? manifestParser.getNamespace() + '\\' + modelName
						: modelName.substr(1) ;
				}

				const propertyModelUnique = this._getInstanceModel(modelName);
				const property = manifestParser.getCurrentProperty(propertyModelUnique, patternPromises);

				if ((property.getName() in properties) && !properties[property.getName()].isEqual(property)) {
					throw new ComhonException(
							`Inheritance conflict on property "${property.getName()}" `+
							`on model "${currentModel.getName()}"`
					);
				}

				properties[property.getName()] = property;
				if (property.hasDefaultValue()) {
					propertiesWithDefault.push(property);
				}
			} while (manifestParser.nextProperty());
		}

		// await for all patterns that must be retrieve from server
		if (patternPromises.size > 0) {
			await Promise.all(patternPromises.values());
		}

		for (const property of propertiesWithDefault) {
			const restriction = Restriction.getFirstNotSatisifed(property.getRestrictions(), property.getDefaultValue());
			if (restriction !== null) {
				throw new NotSatisfiedRestrictionException(property.getDefaultValue(), restriction);
			}
		}

		return properties;
	}

	/**
	 *
	 * @async
	 * @private
	 * @param {Model} model
	 * @param {ManifestParser} manifestParser
	 * @param {Model[]} parentModels
	 * @throws ComhonException
	 */
	async _getSharedIdModel(model,manifestParser, parentModels = null) {
		const parentModel = parentModels !== null && parentModels[0] ? parentModels[0] : null;
		const sharedIdType = manifestParser.sharedId();
		const shareParentId = manifestParser.isSharedParentId();
		let sharedIdModel = null;

		if (parentModel === null) {
			if (shareParentId) {
				throw new ComhonException(`Invalid manifest that define model '${model.getName()}' : '`
					+ ManifestParser.SHARE_PARENT_ID + '\' is set to true but there is no defined extends.'
				);
			}
			if (sharedIdType !== null) {
				throw new ComhonException(`Invalid manifest that define model '${model.getName()}' : '`
					+ ManifestParser.SHARED_ID + '\' is set but there is no defined extends.'
				);
			}
		}

		if (shareParentId && (sharedIdType !== null)) {
			throw new ComhonException(`Conflict in manifest that define model '${model.getName()}' : '`
				+ ManifestParser.SHARED_ID + '\' and ' + ManifestParser.SHARE_PARENT_ID + ' cannot be defined together.'
			);
		}
		if ((parentModel !== null) && shareParentId) {
			sharedIdModel = ObjectCollection.getModelKey(parentModel);
		}
		if (sharedIdType !== null) {
			const modelName = sharedIdType[0] === '\\' ? sharedIdType.substr(1) : manifestParser.getNamespace() + '\\' + sharedIdType;

			sharedIdModel = await this.getInstanceModel(modelName);
			// cannot call isInheritedFrom() on model because parent model is not currently set
			if ((parentModel === null) || (parentModel !== sharedIdModel && !parentModel.isInheritedFrom(sharedIdModel))) {
				throw new ComhonException(`Invalid shared id type in manifest that define '${model.getName()}'. shared id type must be a parent model.`);
			}
			sharedIdModel = ObjectCollection.getModelKey(sharedIdModel);
		}
		return sharedIdModel;
	}

}

export default ModelManager;
