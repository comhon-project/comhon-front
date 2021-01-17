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
import SimpleModel from 'Logic/Model/SimpleModel';
import ModelComplex from 'Logic/Model/ModelComplex';
import ModelArray from 'Logic/Model/ModelArray';
import ModelDateTime from 'Logic/Model/ModelDateTime';
import Model from 'Logic/Model/Model';
import Restriction from 'Logic/Model/Restriction/Restriction';
import NotSatisfiedRestrictionException from 'Logic/Exception/Value/NotSatisfiedRestrictionException';
import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import UnexpectedArrayException from 'Logic/Exception/Value/UnexpectedArrayException';
import ComhonException from 'Logic/Exception/ComhonException';

class ComhonArray extends AbstractComhonObject {

	/**
	 *
	 * @param {Model|ModelArray|SimpleModel} model can be a model name or an instance of model
	 * @param {boolean} isLoaded
	 * @param {string} elementName
	 * @param {boolean} isAssociative not used if first parameter is instance of ModelArray
	 */
	constructor(model, isLoaded = true, elementName = null, isAssociative = false) {
		let objectModel;
		if (model instanceof ModelArray) {
			objectModel = model;
		} else {
			if (!(model instanceof Model) && !(model instanceof SimpleModel)) {
				throw new ComhonException('invalid model, ComhonArray must have ModelUnique or ModelArray');
			}
			objectModel = new ModelArray(model, isAssociative, elementName === null ? model.getShortName() : elementName);
		}
		// ensure that unique model is loaded
		// not sure, I think model doesn't have to be loaded
		//objectModel.getLoadedUniqueModel();
		super(objectModel);
		this.setIsLoaded(isLoaded);
	}

	/**
	 * get class name
	 *
	 * @returns {string}
	 */
	getClassName() {
		return 'ComhonArray';
	}

	/**
	 * get unique contained model
	 *
	 * @returns {Model|SimpleModel}
	 */
	getUniqueModel() {
		return this.getModel().getLoadedUniqueModel();
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::reset()
	 */
	reset() {
		this._reset();
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::loadValue()
	 */
	loadValue(key, propertiesFilter = null, forceLoad = false) {
		if (!(this.getModel() instanceof Model)) {
			throw new ComhonException(`cannot load value, ComhonArray must contain comhon objects`);
		}
		if (!this.issetValue(key)) {
			throw new ComhonException(`cannot load value '${key}', value not set`);
		}
		const value = this.getValue(key);
		return value.load(propertiesFilter, forceLoad);
	}

	/**
	 * add value at the end of array this.values
	 *
	 * @param {*} value
	 * @param {boolean} flagAsUpdated
	 */
	pushValue(value, flagAsUpdated = true) {
		try {
			this.getModel().verifElementValue(value);
		} catch (e) {
			if (e instanceof NotSatisfiedRestrictionException) {
				throw new NotSatisfiedRestrictionException(e.getValue(), e.getRestriction(), e.getIncrement());
			} else if (e instanceof UnexpectedArrayException) {
				throw new UnexpectedArrayException(value, e.getModelArray(), e.getDepth());
			} else if (e instanceof UnexpectedValueTypeException) {
				throw new UnexpectedValueTypeException(value, e.getExpectedType());
			} else {
				throw e;
			}
		}
		this._pushValue(value, flagAsUpdated);
	}

	/**
	 * remove last value from array this.values
	 *
	 * @param {boolean} flagAsUpdated
	 * @returns {*} the last value of array. If array is empty,null will be returned.
	 */
	popValue(flagAsUpdated = true) {
		return this._popValue(flagAsUpdated);
	}

	/**
	 * add value at the beginning of array this.values
	 *
	 * @param {*} value
	 * @param {boolean} flagAsUpdated
	 */
	unshiftValue(value, flagAsUpdated = true) {
		try {
			this.getModel().verifElementValue(value);
		} catch (e) {
			if (e instanceof NotSatisfiedRestrictionException) {
				throw new NotSatisfiedRestrictionException(e.getValue(), e.getRestriction(), e.getIncrement());
			} else if (e instanceof UnexpectedArrayException) {
				throw new UnexpectedArrayException(value, e.getModelArray(), e.getDepth());
			} else if (e instanceof UnexpectedValueTypeException) {
				throw new UnexpectedValueTypeException(value, e.getExpectedType());
			} else {
				throw e;
			}
		}
		this._unshiftValue(value, flagAsUpdated);
	}

	/**
	 * remove first value from array this.values
	 *
	 * @param {boolean} flagAsUpdated
	 * @returns {*} the first value of array. If array is empty,null will be returned.
	 */
	shiftValue(flagAsUpdated = true) {
		return this._shiftValue(flagAsUpdated);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::setValue()
	 */
	setValue(name, value, flagAsUpdated = true) {
		try {
			this.getModel().verifElementValue(value);
		} catch (e) {
			if (e instanceof NotSatisfiedRestrictionException) {
				throw new NotSatisfiedRestrictionException(e.getValue(), e.getRestriction(), e.getIncrement());
			} else if (e instanceof UnexpectedArrayException) {
				throw new UnexpectedArrayException(value, e.getModelArray(), e.getDepth());
			} else if (e instanceof UnexpectedValueTypeException) {
				throw new UnexpectedValueTypeException(value, e.getExpectedType());
			} else {
				throw e;
			}
		}
		super.setValue(name, value, flagAsUpdated);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::initValue()
	 */
	async initValue(key, isLoaded = true, flagAsUpdated = true) {
		const value = await this.getInstanceValue(isLoaded);
		this.setValue(key, value, flagAsUpdated);
		return this.getValue(key);
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                        Values Getters                                         |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 * get instance value
	 *
	 * may only be applied on array that contain a complex model (model instance of ModelComplex)
	 *
	 * @async
	 * @param {string} name
	 * @param {boolean} isLoaded
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async getInstanceValue(isLoaded = true) {
		const containedModel = await this.getModel().getModel();
		if (!(containedModel instanceof ModelComplex)) {
			throw new ComhonException("ComhonArray contain a simple model and can't have instance value");
		}
		return containedModel.getObjectInstance(isLoaded);
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                      ComhonArray Status                                      |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 * verify if a value may be added to comhon array
	 *
	 * @param {ComhonArray} array
	 * @returns {boolean}
	 */
	canAddValue() {
		for (const restriction of this.getModel().getArrayRestrictions()) {
			if (!restriction.satisfy(this, 1)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * verify if a value may be removed from comhon array
	 *
	 * @param {ComhonArray} array
	 * @returns {boolean}
	 */
	canRemoveValue() {
		if (this.count() === 0) {
			return false;
		}
		for (const restriction of this.getModel().getArrayRestrictions()) {
			if (!restriction.satisfy(this, -1)) {
				return false;
			}
		}
		return true;
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
		} else {
			this._resetUpdatedStatus();
			if (this.getModel().getModel() instanceof ModelDateTime) {

				for (const propAndValue of this) {
					if (propAndValue[1] instanceof ComhonDateTime) {
						propAndValue[1].resetUpdatedStatus(false);
					}
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
		if (this.getModel().getModel() instanceof ModelDateTime) {

			for (const propAndValue of this) {
				if (propAndValue[1] instanceof ComhonDateTime) {
					propAndValue[1].resetUpdatedStatus(false);
				}
			}
		}
		else if (this.getModel().getModel().isComplex()) {

			for (const propAndValue of this) {
				if (propAndValue[1] instanceof AbstractComhonObject) {
					propAndValue[1]._resetUpdatedStatusRecursive(oids);
				}
			}
		}
		oids[this.getOid()]--;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::isUpdated()
	 */
	isUpdated() {
		if (!this.isFlaggedAsUpdated()) {
			if (this.getModel().getModel().isComplex()) {

				for (const propAndValue of this) {
					if ((propAndValue[1] instanceof AbstractComhonObject) && propAndValue[1].isUpdated()) {
						return true;
					}
				}
			}
			else if (this.getModel().getModel() instanceof ModelDateTime) {

				for (const propAndValue of this) {
					if ((propAndValue[1] instanceof ComhonDateTime) && propAndValue[1].isUpdated()) {
						return true;
					}
				}
			}
		}
		return this.isFlaggedAsUpdated();
	}

	/**
	 * verify if at least one id value has been updated among all values
	 *
	 * @returns {boolean}
	 */
	isIdUpdated() {
		if (!this.isFlaggedAsUpdated() && this.getModel().getModel().isComplex()) {

			for (const propAndValue of this) {
				if ((propAndValue[1] instanceof AbstractComhonObject) && propAndValue[1].isIdUpdated()) {
					return true;
				}
			}
		}
		return this.isFlaggedAsUpdated();
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::isUpdatedValue()
	 */
	isUpdatedValue(key) {
		if (!this.isFlaggedAsUpdated()) {
			if (this.getModel().getModel().isComplex()) {
				const value = this.getValue(key);
				if ((value instanceof AbstractComhonObject) && value.isUpdated()) {
					return true;
				}
			}
			else if (this.getModel().getModel() instanceof ModelDateTime) {
				const value = this.getValue(key);
				if ((value instanceof ComhonDateTime) && value.isUpdated()) {
					return true;
				}
			}
		}
		return this.isFlaggedAsUpdated();
	}

	/**
	 * validate comhon array.
	 *
	 * validation concern only comhon array restrictions.
	 * throw exception if comhon array is not valid.
	 */
	validate() {
		const restriction = Restriction.getFirstNotSatisifed(this.getModel().getArrayRestrictions(), this);
		if (restriction !== null) {
			throw new NotSatisfiedRestrictionException(this, restriction);
		}
	}

	/**
	 * verify if comhon array is valid.
	 *
	 * validation concern only comhon array restrictions.
	 *
	 * @returns {boolean}
	 */
	isValid() {
		return Restriction.getFirstNotSatisifed(this.getModel().getArrayRestrictions(), this) === null;
	}

	/**
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::getComhonClass()
	 */
	getComhonClass() {
		return `ComhonArray(${this.getModel().getUniqueModelName()})`;
	}

		/***********************************************************************************************\
		|                                                                                               |
		|                                      Model - Properties                                       |
		|                                                                                               |
		\***********************************************************************************************/

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractComhonObject}::_hasToUpdateMainObjectCollection()
	 */
	_hasToUpdateMainObjectCollection(propertyName) {
		return false;
	}

}

export default ComhonArray;
