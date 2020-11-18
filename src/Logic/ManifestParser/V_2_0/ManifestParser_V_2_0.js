/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ManifestParser from 'Logic/ManifestParser/ManifestParser';
import ModelArray from 'Logic/Model/ModelArray';
import ModelDateTime from 'Logic/Model/ModelDateTime';
import SimpleModel from 'Logic/Model/SimpleModel';
import ModelString from 'Logic/Model/ModelString';
import ModelFloat from 'Logic/Model/ModelFloat';
import ModelInteger from 'Logic/Model/ModelInteger';
import Enum from 'Logic/Model/Restriction/Enum';
import Interval from 'Logic/Model/Restriction/Interval';
import Regex from 'Logic/Model/Restriction/Regex';
import Size from 'Logic/Model/Restriction/Size';
import Length from 'Logic/Model/Restriction/Length';
import NotEmptyString from 'Logic/Model/Restriction/NotEmptyString';
import NotEmptyArray from 'Logic/Model/Restriction/NotEmptyArray';
import RegexCollection from 'Logic/Model/Restriction/RegexCollection';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import ManifestException from 'Logic/Exception/Manifest/ManifestException';

class ManifestParser_V_2_0 extends ManifestParser {

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getExtends()
	 */
	getExtends() {
		const extendsValue = this.getInterfacer().getValue(this.getManifest(), ManifestParser._EXTENDS);

		return extendsValue === null ? null : [extendsValue];
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getInheritanceRequestable()
	 */
	getInheritanceRequestable() {
		return this._getPropertyArrayStringValue(this.getManifest(), ManifestParser.INHERITANCE_REQUESTABLES);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::isMain()
	 */
	isMain() {
		return this._getBooleanValue(this.getManifest(), ManifestParser.IS_MAIN, false);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::isAbstract()
	 */
	isAbstract() {
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::isSharedParentId()
	 */
	isSharedParentId() {
		return false;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::sharedId()
	 */
	sharedId() {
		return null;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getLocalModelManifestParsers()
	 */
	getLocalModelManifestParsers() {
		const manifestParsers = {};
		const types = !this.isLocal() && this.getInterfacer().hasValue(this.getManifest(), 'types', true)
			? (
					this.getInterfacer() instanceof XMLInterfacer
						? this.getInterfacer().nodeToArray(this.getInterfacer().getValue(this.getManifest(), 'types', true))
						: this.getInterfacer().getValue(this.getManifest(), 'types', true)
				)
			: [];

		for (const type of types) {
			if (!this.getInterfacer().hasValue(type, ManifestParser.NAME)) {
				throw new ManifestException("local type name not defined");
			}
			const name = this.getInterfacer().getValue(type, ManifestParser.NAME);
			if ((typeof name !== 'string') || name === '') {
				throw new ManifestException("local type name invalid");
			}

			const manifestParser = new this.constructor(type, true, this.getNamespace());
			manifestParsers[this.getNamespace() + '\\' + name] = manifestParser;
		}

		return manifestParsers;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getCurrentProperties()
	 */
	_getCurrentProperties() {
		return this.getInterfacer().hasValue(this.getManifest(), 'properties', true)
			? (
					this.getInterfacer() instanceof XMLInterfacer
						? this.getInterfacer().nodeToArray(this.getInterfacer().getValue(this.getManifest(), 'properties', true))
						: this.getInterfacer().getValue(this.getManifest(), 'properties', true)
				)
			: [];
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getCurrentPropertyModelUniqueName()
	 */
	getCurrentPropertyModelUniqueName() {
		return this._getPropertyModelUniqueName(this._getCurrentPropertyNode());
	}

	/**
	 *
	 * @param {*} property
	 * @returns {string}
	 */
	_getPropertyModelUniqueName(property) {
		let modelName = this.getInterfacer().getValue(property, 'type');
		if (modelName === 'array') {
			modelName = this._getPropertyModelUniqueName(this.getInterfacer().getValue(property, 'values', true));
		}
		return modelName;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_isCurrentPropertyForeign()
	 */
	_isCurrentPropertyForeign() {
		return this._getBooleanValue(this._getCurrentPropertyNode(), ManifestParser.IS_FOREIGN, false);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getBaseInfosProperty()
	 */
	_getBaseInfosProperty(propertyModelUnique, patternPromises) {
		const currentProperty = this._getCurrentPropertyNode();

		let interfaceAsNodeXml = null;
		const isId       = this._getBooleanValue(currentProperty, ManifestParser.IS_ID, false);
		const isPrivate  = this._getBooleanValue(currentProperty, ManifestParser.IS_PRIVATE, false);
		const isNotNull  = this._getBooleanValue(currentProperty, ManifestParser.NOT_NULL, false);
		const isRequired = this._getBooleanValue(currentProperty, ManifestParser.IS_REQUIRED, false);
		const isIsolated = this._getBooleanValue(currentProperty, ManifestParser.IS_ISOLATED, false);
		const name       = this.getInterfacer().getValue(currentProperty, ManifestParser.NAME);
		const auto       = this.getInterfacer().getValue(currentProperty, ManifestParser.AUTO);
		const model      = this._completePropertyModel(currentProperty, propertyModelUnique, patternPromises);

		if (this.getInterfacer().hasValue(currentProperty, ManifestParser.XML_ELEM_TYPE)) {
			const type = this.getInterfacer().getValue(currentProperty, ManifestParser.XML_ELEM_TYPE);
			if (type === ManifestParser.XML_ATTRIBUTE) {
				interfaceAsNodeXml = false;
			} else if (type === ManifestParser.XML_NODE) {
				interfaceAsNodeXml = true;
			} else {
				throw new ManifestException("invalid value 'type' for property '" + ManifestParser.XML_ELEM_TYPE + "'");
			}
		}

		return [name, model, isId, isPrivate, isNotNull, isRequired, isIsolated, interfaceAsNodeXml, auto];
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getAggregationInfos()
	 */
	_getAggregationInfos() {
		return null;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getRestrictions()
	 */
	_getRestrictions(currentNode, model, patternPromises) {
		if (!(model instanceof SimpleModel)) {
			return [];
		}
		const restrictions = [];

		if (this._getBooleanValue(currentNode, ManifestParser.NOT_EMPTY, false)) {
			restrictions.push(new NotEmptyString());
		}
		if (this.getInterfacer().hasValue(currentNode, ManifestParser.LENGTH)) {
			restrictions.push(new Length(this.getInterfacer().getValue(currentNode, ManifestParser.LENGTH)));
		}
		if (this.getInterfacer().hasValue(currentNode, ManifestParser.ENUM, true)) {
			let enumValues = this.getInterfacer().getValue(currentNode, ManifestParser.ENUM, true);
			if (this.getInterfacer() instanceof XMLInterfacer) {
				enumValues = this.getInterfacer().nodeToArray(enumValues);
				if (model instanceof ModelInteger) {
					for (let i = 0; i < enumValues.length; i++) {
						enumValues[i] = parseInt(this.getInterfacer().extractNodeText(enumValues[i]));
					}
				} else if (model instanceof ModelString) {
					for (let i = 0; i < enumValues.length; i++) {
						enumValues[i] = this.getInterfacer().extractNodeText(enumValues[i]);
					}
				} else if (model instanceof ModelFloat) {
					for (let i = 0; i < enumValues.length; i++) {
						enumValues[i] = parseFloat(this.getInterfacer().extractNodeText(enumValues[i]));
					}
				} else {
					throw new ManifestException('enum cannot be defined on ' + model.getName());
				}
			}
			restrictions.push(new Enum(enumValues));
		}
		if (this.getInterfacer().hasValue(currentNode, ManifestParser.INTERVAL)) {
			restrictions.push(new Interval(this.getInterfacer().getValue(currentNode, ManifestParser.INTERVAL), model));
		}
		if (this.getInterfacer().hasValue(currentNode, ManifestParser.PATTERN)) {
			if (this.getInterfacer().hasValue(currentNode, ManifestParser.REGEX)) {
				throw new ManifestException(ManifestParser.PATTERN + ' cannot coexist with ' + ManifestParser.REGEX);
			}
			if (!(model instanceof ModelString)) {
				throw new ManifestException('pattern cannot be defined on ' + model.getName());
			}
			const pattern = this.getInterfacer().getValue(currentNode, ManifestParser.PATTERN);

			if (!RegexCollection.hasRegisteredRegex(pattern)) {
				const promise = RegexCollection.getRegex(pattern);
				patternPromises.set(pattern, promise);
			}
			restrictions.push(RegexCollection.getRegisteredRegex(pattern));
		} else if (this.getInterfacer().hasValue(currentNode, ManifestParser.REGEX)) {
			if (!(model instanceof ModelString)) {
				throw new ManifestException('regex cannot be defined on ' + model.getName());
			}
			const [pattern, flags] = Regex.extractPatternAndFlag(this.getInterfacer().getValue(currentNode, ManifestParser.REGEX));
			restrictions.push(new Regex(pattern, flags));
		}

		return restrictions;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getDefaultValue()
	 */
	_getDefaultValue(propertyModel) {
		const currentProperty = this._getCurrentPropertyNode();
		let defaultValue = null;

		if (this.getInterfacer().hasValue(currentProperty, 'default')) {
			defaultValue = this.getInterfacer().getValue(currentProperty, 'default');
			if (propertyModel instanceof ModelDateTime) {
				const date = new Date(defaultValue);
				if (date.toString() === 'Invalid Date') {
					throw new ManifestException('invalid default value time format : ' + defaultValue);
				}
			} else if (propertyModel instanceof SimpleModel) {
				defaultValue = propertyModel.importValue(defaultValue, this.getInterfacer());
			} else {
				throw new ManifestException('default value can\'t be applied on complex model');
			}
		}

		return defaultValue;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getDependencyProperties()
	 */
	_getDependencyProperties() {
		return this._getPropertyArrayStringValue(this._getCurrentPropertyNode(), ManifestParser.DEPENDS);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getConflicts()
	 */
	getConflicts() {
		let conflicts = [];
		if (!this.getInterfacer().hasValue(this.getManifest(), ManifestParser.CONFLICTS, true)) {
			return conflicts;
		}
		conflicts = this.getInterfacer().getValue(this.getManifest(), ManifestParser.CONFLICTS, true);
		if (this.getInterfacer() instanceof XMLInterfacer) {
			conflicts = this.getInterfacer().nodeToArray(conflicts);
			for (let i = 0; i < conflicts.length; i++) {
				conflicts[i] = this._getArrayStringValue(conflicts[i]);
			}
		}

		return conflicts;
	}

	/**
	 * add model container if needed
	 *
	 * @private
	 * @param {*} propertyNode
	 * @param {Model|SimpleModel} uniqueModel
	 * @throws {ComhonException}
	 * @returns {AbstractModel}
	 */
	_completePropertyModel(propertyNode, uniqueModel, patternPromises) {
		let model = uniqueModel;

		if (this._isArrayNode(propertyNode) || this._isAggregationNode(propertyNode)) {
			const valuesNode = this.getInterfacer().getValue(propertyNode, 'values', true);
			if (valuesNode === null) {
				throw new ManifestException('arrays and aggregations must have a values node');
			}
			const valuesName = this.getInterfacer().getValue(valuesNode, 'name');
			if (valuesName === null) {
				throw new ManifestException('arrays and aggregations must have a values name property');
			}
			let isAssociative, isNotNullElement, isIsolatedElement, subModel, elementRestrictions;
			if (this._isAggregationNode(propertyNode)) {
				isAssociative = false;
				isNotNullElement = true;
				isIsolatedElement = true;

				subModel = uniqueModel;
				elementRestrictions = [];
			} else {
				isAssociative = this._getBooleanValue(propertyNode, ManifestParser.IS_ASSOCIATIVE, false);
				isNotNullElement = this._getBooleanValue(valuesNode, ManifestParser.NOT_NULL, false);
				isIsolatedElement = this._getBooleanValue(valuesNode, ManifestParser.IS_ISOLATED, false);

				subModel = this._completePropertyModel(valuesNode, uniqueModel, patternPromises);
				elementRestrictions = subModel instanceof ModelArray ? [] : this._getRestrictions(valuesNode, uniqueModel, patternPromises);
			}
			const arrayRestrictions = [];

			if (this.getInterfacer().hasValue(propertyNode, ManifestParser.SIZE)) {
				arrayRestrictions.push(new Size(this.getInterfacer().getValue(propertyNode, ManifestParser.SIZE)));
			}
			if (this._getBooleanValue(propertyNode, ManifestParser.NOT_EMPTY, false)) {
				arrayRestrictions.push(new NotEmptyArray());
			}
			model = new ModelArray(subModel, isAssociative, valuesName, arrayRestrictions, elementRestrictions, isNotNullElement, isIsolatedElement);
		}
		return model;
	}

	/**
	 *
	 * @param {*} propertyNode
	 * @returns {boolean}
	 */
	_isArrayNode(propertyNode) {
		return this.getInterfacer().getValue(propertyNode, 'type') === 'array';
	}

	/**
	 *
	 * @param {*} propertyNode
	 * @returns {boolean}
	 */
	_isAggregationNode(propertyNode) {
		return false;
	}

}

export default ManifestParser_V_2_0;
