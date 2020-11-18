/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ForeignProperty from 'Logic/Model/Property/ForeignProperty';
import ComhonException from 'Logic/Exception/ComhonException';

class AggregationProperty extends ForeignProperty {

	/** @type {string[]} */
	#aggregationProperties = null;

	/**
	 *
	 * @param {ModelForeign} model
	 * @param {string} name
	 * @param {string[]} aggregationProperties
	 * @param {boolean} isPrivate
	 * @param {boolean} dependencies
	 * @throws {ComhonException}
	 */
	constructor(model, name, aggregationProperties, isPrivate = false, dependencies = []) {
		super(model, name, isPrivate, false, true, dependencies);
		if (!Array.isArray(aggregationProperties)) {
			throw new ComhonException('aggregationProperties must be an array');
		}
		if (aggregationProperties.length === 0) {
			throw new ComhonException('aggregation must have at least one aggregation property');
		}
		this.#aggregationProperties = aggregationProperties;
		Object.freeze(this.#aggregationProperties);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::isAggregation()
	 */
	isAggregation() {
		return true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::getAggregationProperties()
	 */
	getAggregationProperties() {
		return this.#aggregationProperties;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {ForeignProperty}::loadValue()
	 * @throws {ComhonException} cannot call this function for aggregation
	 */
	async loadValue(object, propertiesFilter = null, forceLoad = false) {
		throw new ComhonException('cannot load aggregation value');
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::isEqual()
	 */
	isEqual(property) {
		if (this === property) {
			return true;
		}
		return super.isEqual(property)
			&& this.#aggregationProperties.length === property.getAggregationProperties().length
			&& property.getAggregationProperties().every((value) => this.#aggregationProperties.indexOf(value) !== -1);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Property}::isInterfaceable()
	 */
	isInterfaceable(isPrivate) {
		return false;
	}

}

export default AggregationProperty;
