/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @abstract
 */
class Restriction {

	constructor() {
		if (this.constructor === Restriction) {
			throw new Error('can\'t instanciate abstract class ' + this.constructor.name);
		}
  }

	/**
	 * verify if specified value satisfy restriction
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {boolean}
	 */
	satisfy(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if specified restriction is equal to this
	 *
	 * @abstract
	 * @param {Restriction} restriction
	 * @returns {boolean}
	 */
	isEqual(restriction) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if specified model can use this restriction
	 *
	 * @abstract
	 * @param {AbstractModel} model
	 * @returns {boolean}
	 */
	isAllowedModel(model) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * stringify restriction and value
	 *
	 * @abstract
	 * @param {*} value
	 * @returns {string}
	 */
	toMessage(value) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * stringify restriction
	 *
	 * @abstract
	 * @returns {string}
	 */
	toString() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if restrictions given are equals (compare restrictions stored on same keys)
	 *
	 * @param {Restriction[]} firstRestrictions
	 * @param {Restriction[]} secondRestrictions
	 * @returns {boolean} if true, all restrictions are equals
	 */
	static compare(firstRestrictions, secondRestrictions) {
		if (firstRestrictions.length !== secondRestrictions.length) {
			return false;
		}
		const firstRestrictionsMap = {};
		for (const restriction of firstRestrictions) {
			firstRestrictionsMap[restriction.constructor.name] = restriction;
		}
		for (const restriction of secondRestrictions) {
			const key = restriction.constructor.name;
			if (!(key in firstRestrictionsMap) || !restriction.isEqual(firstRestrictionsMap[key])) {
				return false;
			}
		}
		return true;
	}

	/**
	 * find first restriction that satisfy given value
	 *
	 * @param {Restriction[]} restrictions
	 * @param {*} value
	 * @returns {Restriction|void} null if all restrictions are satisfied
	 */
	static getFirstNotSatisifed(restrictions, value) {
		for (const restriction of restrictions) {
			if (!restriction.satisfy(value)) {
				return restriction;
			}
		}
		return null;
	}

}

export default Restriction;
