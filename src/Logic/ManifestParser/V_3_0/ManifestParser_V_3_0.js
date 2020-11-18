/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ManifestParser from 'Logic/ManifestParser/ManifestParser';
import ManifestParser_V_2_0 from 'Logic/ManifestParser/V_2_0/ManifestParser_V_2_0';
import ManifestException from 'Logic/Exception/Manifest/ManifestException';
import Interfacer from 'Logic/Interfacer/Interfacer';

const propertyToSimpleModel = {
	'Comhon\\Manifest\\Property\\String': 'string',
	'Comhon\\Manifest\\Property\\Integer': 'integer',
	'Comhon\\Manifest\\Property\\Index': 'index',
	'Comhon\\Manifest\\Property\\Float': 'float',
	'Comhon\\Manifest\\Property\\Percentage': 'percentage',
	'Comhon\\Manifest\\Property\\Boolean': 'boolean',
	'Comhon\\Manifest\\Property\\DateTime': 'dateTime'
};
Object.freeze(propertyToSimpleModel);

const valueToSimpleModel = {
	'Comhon\\Manifest\\Value\\String': 'string',
	'Comhon\\Manifest\\Value\\Integer': 'integer',
	'Comhon\\Manifest\\Value\\Index': 'index',
	'Comhon\\Manifest\\Value\\Float': 'float',
	'Comhon\\Manifest\\Value\\Percentage': 'percentage',
	'Comhon\\Manifest\\Value\\Boolean': 'boolean',
	'Comhon\\Manifest\\Value\\DateTime': 'dateTime'
};
Object.freeze(valueToSimpleModel);

class ManifestParser_V_3_0 extends ManifestParser_V_2_0 {

	/** @type {Object} */
	static get PROPERTY_TO_SIMPLE_MODEL() {return propertyToSimpleModel;}

	/** @type {Object} */
	static get VALUE_TO_SIMPLE_MODEL() {return valueToSimpleModel;}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::isAbstract()
	 */
	isAbstract() {
		return this._getBooleanValue(this.getManifest(), ManifestParser.IS_ABSTRACT, false);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::isSharedParentId()
	 */
	isSharedParentId() {
		return this._getBooleanValue(this.getManifest(), ManifestParser.SHARE_PARENT_ID, false);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::sharedId()
	 */
	sharedId() {
		return this.getInterfacer().getValue(this.getManifest(), ManifestParser.SHARED_ID);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getExtends()
	 */
	getExtends() {
		return this.getInterfacer().hasValue(this.getManifest(), ManifestParser._EXTENDS, true)
			? this._getPropertyArrayStringValue(this.getManifest(), ManifestParser._EXTENDS)
			: null;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::getCurrentPropertyModelUniqueName()
	 */
	getCurrentPropertyModelUniqueName() {
		let modelName;
		const propertyNode = this._getCurrentPropertyNode();
		const inheritance = this.getInterfacer().getValue(propertyNode, Interfacer.INHERITANCE_KEY);
		
		if (inheritance in ManifestParser_V_3_0.PROPERTY_TO_SIMPLE_MODEL) {
			modelName = ManifestParser_V_3_0.PROPERTY_TO_SIMPLE_MODEL[inheritance];
		} else if (inheritance === 'Comhon\\Manifest\\Property\\Object') {
			modelName = this.getInterfacer().getValue(propertyNode, 'model');
		} else if (inheritance === 'Comhon\\Manifest\\Property\\Array') {
			modelName = this._getValueModelUniqueName(this.getInterfacer().getValue(propertyNode, 'values', true));
		} else if (inheritance === 'Comhon\\Manifest\\Property\\Aggregation') {
			const valuesNode = this.getInterfacer().getValue(propertyNode, 'values', true);
			modelName = this.getInterfacer().getValue(valuesNode, 'model');
		} else {
			throw new ManifestException('invalid ' + Interfacer.INHERITANCE_KEY + ' value : ' + inheritance);
		}
		return modelName;
	}

	/**
	 *
	 * @param {*} property
	 * @returns {string}
	 */
	_getValueModelUniqueName(valuesNode) {
		let modelName;
		const inheritance = this.getInterfacer().getValue(valuesNode, Interfacer.INHERITANCE_KEY);

		if (inheritance in ManifestParser_V_3_0.VALUE_TO_SIMPLE_MODEL) {
			modelName = ManifestParser_V_3_0.VALUE_TO_SIMPLE_MODEL[inheritance];
		} else if (inheritance === 'Comhon\\Manifest\\Value\\Object') {
			modelName = this.getInterfacer().getValue(valuesNode, 'model');
		} else if (inheritance === 'Comhon\\Manifest\\Value\\Array') {
			modelName = this._getValueModelUniqueName(this.getInterfacer().getValue(valuesNode, 'values', true));
		} else {
			throw new ManifestException('invalid ' + Interfacer.INHERITANCE_KEY + ' array value : ' + inheritance);
		}
		return modelName;
	}

	/**
	 *
	 * @param {*} node
	 * @returns {boolean}
	 */
	_isArrayNode(node) {
		const inheritance = this.getInterfacer().getValue(node, Interfacer.INHERITANCE_KEY);
		return inheritance === 'Comhon\\Manifest\\Property\\Array' || inheritance === 'Comhon\\Manifest\\Value\\Array';
	}

	/**
	 *
	 * @param {*} propertyNode
	 * @returns {boolean}
	 */
	_isAggregationNode(propertyNode) {
		return this.getInterfacer().getValue(propertyNode, Interfacer.INHERITANCE_KEY) === 'Comhon\\Manifest\\Property\\Aggregation';
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_getAggregationInfos()
	 */
	_getAggregationInfos() {
		let aggregations = null;
		const propertyNode = this._getCurrentPropertyNode();

		if (this._isAggregationNode(propertyNode) && this.getInterfacer().hasValue(propertyNode, ManifestParser.AGGREGATIONS, true)) {
			aggregations = this._getPropertyArrayStringValue(propertyNode, ManifestParser.AGGREGATIONS);
			if (!Array.isArray(aggregations) || aggregations.length === 0) {
				throw new ManifestException('aggregation must have at least one aggregation property');
			}
		}

		return aggregations;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ManifestParser}::_isCurrentPropertyForeign()
	 */
	_isCurrentPropertyForeign() {
		let node = this._getCurrentPropertyNode();
		if (this._isAggregationNode(node)) {
			return  true;
		}
		while (this._isArrayNode(node)) {
			node = this.getInterfacer().getValue(node, 'values', true);
		}
		return this._getBooleanValue(node, ManifestParser.IS_FOREIGN, false);
	}
}

export default ManifestParser_V_3_0;
