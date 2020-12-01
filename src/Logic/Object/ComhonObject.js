/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractComhonObject from 'Logic/Object/AbstractComhonObject';
import ComhonDateTime from 'Logic/Object/ComhonDateTime';
import ComhonArray from 'Logic/Object/ComhonArray';
import MainObjectCollection from 'Logic/Object/Collection/MainObjectCollection';
import Model from 'Logic/Model/Model';
import ModelComplex from 'Logic/Model/ModelComplex';
import Requester from 'Logic/Requester/ComhonRequester';
import ComhonException from 'Logic/Exception/ComhonException';
import NotSatisfiedRestrictionException from 'Logic/Exception/Value/NotSatisfiedRestrictionException';
import UnexpectedArrayException from 'Logic/Exception/Value/UnexpectedArrayException';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import MissingRequiredValueException from 'Logic/Exception/Object/MissingRequiredValueException';
import ConflictValuesException from 'Logic/Exception/Object/ConflictValuesException';
import DependsValuesException from 'Logic/Exception/Object/DependsValuesException';
import CastComhonObjectException from 'Logic/Exception/Model/CastComhonObjectException';
import ArgumentException from 'Logic/Exception/ArgumentException';
import AbstractObjectException from 'Logic/Exception/Object/AbstractObjectException';

class ComhonObject extends AbstractComhonObject {

	/**
	 * @type {boolean} determine if current object has been casted
	 */
	#isCasted = false;

	/**
	 *
	 * @param {Model} model can be a model name or an instance of model
	 * @param {boolean} isLoaded
	 */
	constructor(model, isLoaded = true) {
		if (!(model instanceof Model)) {
			throw new ComhonException('invalid model, ComhonObject must have instance of Model');
		}
		if (model.getClassName() === 'ModelRoot') {
			throw new ComhonException('invalid model, ComhonObject cannot have instance of ModelRoot');
		}
		if (!model.isLoaded()) {
				throw new ComhonException(`model '${model.getName()}' not loaded`)
		}
		super(model);

		for (const property of model.getPropertiesWithDefaultValues()) {
			this.setValue(property.getName(), property.getDefaultValue(), false);
		}
		this.setIsLoaded(isLoaded);
	}

	/**
	 * get class name
	 *
	 * @returns {string}
	 */
	getClassName() {
		return 'ComhonObject';
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                        Values Setters                                         |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::reset()
	 *
	 * @param {boolean} resetId if false and object has id, object is reset except id
	 */
	reset(resetId = true) {
		const values = new Map();
		if (this.getModel().hasIdProperties())  {
			if (resetId) {
				if (this.getModel().isMain()) {
					MainObjectCollection.removeObject(this, false);
				}
			} else {
				for (const property of this.getModel().getIdProperties()) {
					if (this.issetValue(property.getName())) {
						values.set(property.getName(), this.getValue(property.getName()));
					}
				}
			}
		}
		for (const property of this.getModel().getPropertiesWithDefaultValues()) {
			values.set(property.getName(), property.getDefaultValue());
		}
		this._reset();
		let key, value;
		for ([key, value] of values) {
			this.setValue(key, value, false);
		}
	}

	/**
	 * set id (model associated to comhon object must have at least one id property)
	 *
	 * @param {*} id
	 * @param {boolean} flagAsUpdated
	 * @throws {ComhonException}
	 */
	setId(id, flagAsUpdated = true) {
		if (!this.getModel().hasIdProperties()) {
			throw new ComhonException(`cannot set id. model ${this.getModel().getName()} doesn't have id property`);
		}
		if (this.getModel().hasUniqueIdProperty()) {
			this.setValue(this.getModel().getUniqueIdProperty().getName(), id, flagAsUpdated);
		}
		else {
			const idValues = this.getModel().decodeId(id);
			let i = 0;
			for (const property of this.getModel().getIdProperties()) {
				this.setValue(property.getName(), idValues[i], flagAsUpdated);
				i++;
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::setValue()
	 */
	setValue(name, value, flagAsUpdated = true) {
		try {
			const property = this.getModel().getProperty(name, true);
			property.validate(value);
			if (property.isAggregation()) {
				flagAsUpdated = false;
			}
		} catch (e) {
			if (e instanceof NotSatisfiedRestrictionException) {
				throw new NotSatisfiedRestrictionException(e.getValue(), e.getRestriction());
			} else if (e instanceof UnexpectedArrayException) {
				throw new UnexpectedArrayException(value, e.getModelArray(), e.getDepth());
			} else if (e instanceof UnexpectedValueTypeException) {
				throw new UnexpectedValueTypeException(value, e.getExpectedType());
			} else {
				throw e;
			}
		}
		// previous exception catched is thrown again to simplify trace stack

		super.setValue(name, value, flagAsUpdated);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::initValue()
	 */
	async initValue(name, isLoaded = true, flagAsUpdated = true) {
		const value = await this.getInstanceValue(name, isLoaded);
		this.setValue(name, value, flagAsUpdated);
		return this.getValue(name);
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                        Values Getters                                         |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 * get instance value
	 *
	 * may only be applied on property with complex model (model instance of ModelComplex)
	 *
	 * @async
	 * @param {string} name
	 * @param {boolean} isLoaded
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async getInstanceValue(name, isLoaded = true) {
		const propertyModel = await this.getModel().getProperty(name, true).getModel();
		if (!(propertyModel instanceof ModelComplex)) {
			throw new ComhonException("property 'name' has a simple model and can't have instance value");
		}
		return propertyModel.getObjectInstance(isLoaded);
	}

	/**
	 * get id of comhon object
	 *
	 * @returns {*} return null if model associated to comhon object doesn't have id properties
	 */
	getId() {
		if (this.getModel().hasUniqueIdProperty()) {
			return this.getValue(this.getModel().getUniqueIdProperty().getName());
		}
		const values = [];
		for (const property of this.getModel().getIdProperties()) {
			values.push(this.getValue(property.getName()));
		}
		return this._encodeId(values);
	}

	/**
	 * encode multiple ids in json format
	 * TODO use should use Model.encodeId or create class idEncoder
	 *
	 * @param {array} idValues
	 * @returns {string}
	 */
	_encodeId(idValues) {
		return idValues.length > 0 ? null : JSON.stringify(idValues);
	}

	/**
	 * verify if id value(s) is(are) set
	 *
	 * @returns {boolean} true if all id values are set or if associated model doesn't have id properties
	 */
	hasCompleteId() {
		for (const property of this.getModel().getIdProperties()) {
			if(this.getValue(property.getName()) === null || this.getValue(property.getName()) === '') {
				return false;
			}
		}
		return true;
	}

	/**
	 * verify if at least one id value is set
	 *
	 * @returns {boolean} true if no one id value is set or if model doesn't have id properties
	 */
	hasEmptyId() {
		for (const property of this.getModel().getIdProperties()) {
			if(this.getValue(property.getName()) !== null) {
				return false;
			}
		}
		return true;
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                      ComhonObject Status                                      |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::isUpdated()
	 */
	isUpdated() {
		if (!this.isFlaggedAsUpdated()) {
			for (const property of this.getModel().getComplexProperties()) {
				if (this.isUpdatedValue(property.getName())) {
					return true;
				}
			}
			for (const property of this.getModel().getDateTimeProperties()) {
				if (this.isUpdatedValue(property.getName())) {
					return true;
				}
			}
		}
		return this.isFlaggedAsUpdated();
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::isIdUpdated()
	 */
	isIdUpdated() {
	for (const property of this.getModel().getIdProperties()) {
			if (this.isUpdatedValue(property.getName())) {
				return true;
			}
		}
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::isUpdatedValue()
	 */
	isUpdatedValue(name) {
		if (this.getModel().hasProperty(name)) {
			if (this.getUpdatedValues().has(name)) {
				return true;
			} else if (this.hasValue(name)) {
				if (this.getValue(name) instanceof AbstractComhonObject) {
					return this.getModel().getProperty(name).isForeign()
						? this.getValue(name).isIdUpdated()
						: this.getValue(name).isUpdated();
				}
				else if (this.getValue(name) instanceof ComhonDateTime) {
					return this.getValue(name).isUpdated();
				}
			}
		}
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::resetUpdatedStatus()
	 */
	resetUpdatedStatus(recursive = true) {
		if (recursive) {
			const oids = {};
			this._resetUpdatedStatusRecursive(oids);
		}else {
			this._resetUpdatedStatus();
			for (const property of this.getModel().getDateTimeProperties()) {
				const propertyName = property.getName();
				if (this.hasValue(propertyName) && (this.getValue(propertyName) instanceof ComhonDateTime)) {
					this.getValue(propertyName).resetUpdatedStatus(false);
				}
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::_resetUpdatedStatusRecursive()
	 */
	_resetUpdatedStatusRecursive(oids) {
		if ((this.getOid() in oids)) {
			if (oids[this.getOid()] > 0) {
				console.log('Warning loop detected');
				return;
			}
		} else {
			oids[this.getOid()] = 0;
		}
		oids[this.getOid()]++;
		this._resetUpdatedStatus();
		for (const property of this.getModel().getComplexProperties()) {
			const propertyName = property.getName();
			if (!property.isForeign()) {
				if (this.hasValue(propertyName) && (this.getValue(propertyName) instanceof AbstractComhonObject)) {
					this.getValue(propertyName)._resetUpdatedStatusRecursive(oids);
				}
			} else if (this.issetValue(propertyName) && (this.getValue(propertyName) instanceof ComhonArray)) {
				this.getValue(propertyName).resetUpdatedStatus(false);
			}
		}
		for (const property of this.getModel().getDateTimeProperties()) {
			const propertyName = property.getName();
			if (this.hasValue(propertyName) && (this.getValue(propertyName) instanceof ComhonDateTime)) {
				this.getValue(propertyName).resetUpdatedStatus(false);
			}
		}
		oids[this.getOid()]--;
	}

	/**
	 * verify if comhon object has been casted
	 *
	 * @returns {boolean}
	 */
	isCasted() {
		return this.#isCasted;
	}

	/**
	 * validate comhon object.
	 *
	 * validation concern only required properties, conflicts, dependencies.
	 * throw exception if comhon object is not valid.
	 */
	validate() {
		for (const property of this.getModel().getRequiredProperties()) {
			if (!this.hasValue(property.getName())) {
				throw new MissingRequiredValueException(this, property.getName());
			}
		}
		let name, properties;
		for ([name, properties] of this.getModel().getConflicts()) {
			if (this.hasValue(name)) {
				for (const propertyName of properties) {
					if (this.hasValue(propertyName)) {
						throw new ConflictValuesException(this.getModel(), [name, propertyName]);
					}
				}
			}
		}
		for (const property of this.getModel().getDependsProperties()) {
			if (this.hasValue(property.getName())) {
				for (const propertyName of property.getDependencies()) {
					if (!this.hasValue(propertyName)) {
						throw new DependsValuesException(property.getName(), propertyName);
					}
				}
			}
		}
	}

	/**
	 * verify if comhon object is valid.
	 *
	 * validation concern only required properties, conflicts, dependencies.
	 *
	 * @returns {boolean}
	 */
	isValid() {
		try {
			this.validate();
		} catch (e) {
			return false;
		}
		return true;
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                      Model - Properties                                       |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 * verify if current object model is same as given model or is inherited from given model
	 *
	 * @param {Model} model model name or model instance
	 * @returns {boolean}
	 */
	isA(model) {
		if (!(model instanceof Model)) {
			throw new ArgumentException(model, ['string', 'Model'], 1);
		}
		return this.getModel() === model || this.getModel().isInheritedFrom(model);
	}

	/**
	 * cast comhon object
	 *
	 * update current model to specified model.
	 * new model must inherit from current model otherwise an exception is thrown
	 *
	 * @param {Model} model
	 * @throws {CastComhonObjectException}
	 */
	cast(model) {
		if (this.getModel() === model) {
			return;
		}
		if (!model.isInheritedFrom(this.getModel())) {
			throw new CastComhonObjectException(model, this.getModel());
		}
		let addObject = false;
		if (this.hasCompleteId() && this.getModel().hasIdProperties()) {
			const object = MainObjectCollection.getObject(this.getId(), model);
			if (object === null || object === this) {
				addObject = true;
				if (MainObjectCollection.hasObject(this.getId(), model, false)) {
					throw new ComhonException(`Cannot cast object to '${model.getName()}'. ComhonObject with id '${this.getId()}' and model '${model.getName()}' already exists in MainObjectCollection`);
				}
			}
		}
		let originalModel;
		try {
			if (this.getModel().isMain() && addObject) {
				MainObjectCollection.removeObject(this);
			}
			originalModel = this.getModel();
			this._updateModel(model);

			if (this.isLoaded() && this.getModel().isAbstract()) {
				throw new AbstractObjectException(this);
			}
			if (this.getModel().isMain() && addObject) {
				MainObjectCollection.addObject(this);
			}
		} catch (e) {
			this._updateModel(originalModel);
			throw e;
		}
		this.#isCasted = true;
	}

	/**
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::getComhonClass()
	 */
	getComhonClass() {
		return `ComhonObject(${this.getModel().getName()})`;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::_hasToUpdateMainObjectCollection()
	 */
	_hasToUpdateMainObjectCollection(propertyName) {
		return this.getModel().isMain() && this.getModel().hasIdProperty(propertyName);
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                Serialization / Deserialization                                |
		|                                                                                               |
		\***********************************************************************************************/



	/**
	 * load (deserialize) comhon object using model serialization
	 *
	 * @async
	 * @param {string[]} propertiesFilter
	 * @param {boolean} forceLoad if object already exists and is already loaded, force to reload object
	 * @throws {ComhonException}
	 * @returns {Promise<boolean>} promise that return true if success
	 */
	async load(propertiesFilter = null, forceLoad = false) {
		let success = false;
		if (!this.isLoaded() || forceLoad) {
			success = await Requester.loadObject(this, propertiesFilter);
    }
		return success;
	}

	/**
	 * save (serialize) comhon object using model serialization
	 *
	 * create or update serialized object. some serializations may require id property(ies)
	 *
	 * @param {string} operation
	 * @throws {ComhonException}
	 * @returns {integer} count of affected serialized object
	 */
	save(operation) {
		// TODO return a promise
		// return saveobjectonserver;
	}

	/**
	 * delete serialized object
	 *
	 * model must have id property and id value of comhon object must be set
	 *
	 * @throws {ComhonException}
	 * @returns {integer} count of deleted object
	 */
	delete() {
		// TODO return a promise
		// return deleteobjectonserver;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::loadValue()
	 */
	loadValue(name, propertiesFilter = null, forceLoad = false) {
		const property = this.getModel().getProperty(name, true);
		return property.loadValue(this.getValue(name), propertiesFilter, forceLoad);
	}

}

export default ComhonObject;
