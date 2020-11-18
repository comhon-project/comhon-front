/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Restriction from 'Logic/Model/Restriction/Restriction';
import ModelFloat from 'Logic/Model/ModelFloat';
import ModelDateTime from 'Logic/Model/ModelFloat';
import ModelInteger from 'Logic/Model/ModelInteger';
import ComhonDateTime from 'Logic/Object/ComhonDateTime';
import MalformedIntervalException from 'Logic/Exception/Restriction/MalformedIntervalException';
import NotSupportedModelIntervalException from 'Logic/Exception/Restriction/NotSupportedModelIntervalException';

const dateTime = /^([[\]])([^,]*),([^,]*)([[\]])$/;
const float = /^([[\]])\s*((?:-?\d+(?:\.\d+)?)|(?:\d*))\s*,\s*((?:-?\d+(?:\.\d+)?)|(?:\d*))\s*([[\]])$/;
const integer = /^([[\]])\s*((?:-?\d+)|(?:\d*))\s*,\s*((?:-?\d+)|(?:\d*))\s*([[\]])$/;

class Interval extends Restriction {

	// following regexs doesn't verify if left endpoint is inferior than right endpoint
	// there's no verification on date format only interval structure is checked

	/**
	 * @type {string} regex to check date time interval validity
	 *     regex doesn't verify if left endpoint is inferior than right endpoint
	 *     there's no verification on date format only interval structure is checked
	 */
	static get DATETIME_INTERVAL() {return dateTime;}

	/**
	 * @type {string} regex to check float interval validity
	 *     regex doesn't verify if left endpoint is inferior than right endpoint
	 */
	static get FLOAT_INTERVAL() {return float;}

	/**
	 * @type {string} regex to check integer interval validity
	 *     regex doesn't verify if left endpoint is inferior than right endpoint
	 */
	static get INTEGER_INTERVAL() {return integer;}

	/** @type {*} */
	#leftEndPoint  = null;

	/** @type {*} */
	#rightEndPoint = null;

	/** @type {boolean} */
	#isLeftClosed  = true;

	/** @type {boolean} */
	#isRightClosed = true;

	/** @type {SimpleModel} */
	#model;

	/**
	 *
	 * @param {string} interval
	 * @param {SimpleModel} model
	 * @throws {MalformedIntervalException}
	 * @throws {NotSupportedModelIntervalException}
	 */
	constructor(interval, model) {
		super();
		let matches;
		if (model instanceof ModelFloat) {
			if ((matches = Interval.FLOAT_INTERVAL.exec(interval)) === null) {
				throw new MalformedIntervalException(interval);
			}
			matches[2] = matches[2] === '' ? null : parseFloat(matches[2]);
			matches[3] = matches[3] === '' ? null : parseFloat(matches[3]);
		}
		else if (model instanceof ModelInteger) {
			if ((matches = Interval.INTEGER_INTERVAL.exec(interval)) === null) {
				throw new MalformedIntervalException(interval);
			}
			matches[2] = matches[2] === '' ? null : parseInt(matches[2]);
			matches[3] = matches[3] === '' ? null : parseInt(matches[3]);
		}
		else if (model instanceof ModelDateTime) {
			if ((matches = Interval.DATETIME_INTERVAL.exec(interval)) === null) {
				throw new MalformedIntervalException(interval);
			}
			matches[2] = matches[2].trim();
			matches[3] = matches[3].trim();
			matches[2] = matches[2] === '' ? null : new Date(matches[2]);
			matches[3] = matches[3] === '' ? null : new Date(matches[3]);
		} else {
			throw new NotSupportedModelIntervalException(model);
		}
		this.#isLeftClosed  = matches[1] === '[';
		this.#isRightClosed = matches[4] === ']';
		this.#leftEndPoint  = matches[2];
		this.#rightEndPoint = matches[3];
		this.#model = model;

		if ((this.#leftEndPoint !== null) && (this.#rightEndPoint !== null) && this.#leftEndPoint > this.#rightEndPoint) {
			throw new MalformedIntervalException(interval);
		}
	}

	/**
	 * verify if interval is left closed
	 */
	_isLeftClosed() {
		return this.#isLeftClosed;
	}

	/**
	 * verify if interval is left closed
	 */
	_getLeftEndPoint() {
		return this.#leftEndPoint;
	}

	/**
	 * verify if interval is left closed
	 */
	_isRightClosed() {
		return this.#isRightClosed;
	}

	/**
	 * verify if interval is left closed
	 */
	_getRightEndPoint() {
		return this.#rightEndPoint;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::satisfy()
	 */
	satisfy(value) {
		if (value === null) {
			return false;
		}
		if (this.#leftEndPoint !== null) {
			if (this.#isLeftClosed) {
				if (value < this.#leftEndPoint) {
					return false;
				}
			} else if (value <= this.#leftEndPoint) {
				return false;
			}
		}
		if (this.#rightEndPoint !== null) {
			if (this.#isRightClosed) {
				if (value > this.#rightEndPoint) {
					return false;
				}
			} else if (value >= this.#rightEndPoint) {
				return false;
			}
		}
		return true;
	}


	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isEqual()
	 */
	isEqual(restriction) {
		return this === restriction
			|| (
				(restriction instanceof Interval)
				&& this.#model === restriction.#model
				&& this.#isLeftClosed  === restriction.#isLeftClosed
				&& this.#isRightClosed === restriction.#isRightClosed
				&& this.#leftEndPoint  === restriction.#leftEndPoint
				&& this.#rightEndPoint === restriction.#rightEndPoint
			);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::isAllowedModel()
	 */
	isAllowedModel(model) {
		return model === this.#model;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toMessage()
	 */
	toMessage(value) {
		if ((typeof value !== 'number') && !(value instanceof ComhonDateTime)) {
			const type = (typeof value === 'object' && value !== null) ? value.constructor.name : typeof value;
			return `Value passed to Interval must be an integer, float or instance of ComhonDateTime, instance of ${type} given`;
		}

		return ((value instanceof ComhonDateTime) ? value.toISOString() : value)
			+ ' is' + (this.satisfy(value) ? ' ' : ' not ')
			+ 'in interval '
			+ (this.#isLeftClosed ? '[' : ']')
			+ ((this.#leftEndPoint instanceof Date)	? this.#leftEndPoint.toISOString()	: this.#leftEndPoint)
			+ ','
			+ ((this.#rightEndPoint instanceof Date) ? this.#rightEndPoint.toISOString() : this.#rightEndPoint)
			+ (this.#isRightClosed ? ']' : '[');
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Restriction}::toString()
	 */
	toString() {
		return (this.#isLeftClosed ? '[' : ']')
			+ ((this.#leftEndPoint instanceof Date)	? this.#leftEndPoint.toISOString()	: this.#leftEndPoint)
			+ ','
			+ ((this.#rightEndPoint instanceof Date) ? this.#rightEndPoint.toISOString() : this.#rightEndPoint)
			+ (this.#isRightClosed ? ']' : '[');
	}

}

export default Interval;
