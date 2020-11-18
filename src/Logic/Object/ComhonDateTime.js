/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class ComhonDateTime extends Date {

	/** @type {boolean} */
	#isUpdated = false;

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setDate()
	 */
	setDate(dayValue) {
		super.setDate(dayValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setFullYear()
	 */
	setFullYear(yearValue, monthValue = null, dateValue = null) {
		super.setFullYear(yearValue, monthValue, dateValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setHours()
	 */
	setHours(hoursValue, minutesValue = null, secondsValue = null, msValue = null) {
		super.setHours(hoursValue, minutesValue, secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setMilliseconds()
	 */
	setMilliseconds(millisecondsValue) {
		super.setMilliseconds(millisecondsValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setMinutes()
	 */
	setMinutes(minutesValue, secondsValue = null, msValue = null) {
		super.setMinutes(minutesValue, secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setMonth()
	 */
	setMonth(monthValue, dayValue = null) {
		super.setMonth(monthValue, dayValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setSeconds()
	 */
	setSeconds(secondsValue, msValue = null) {
		super.setSeconds(secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setTime()
	 */
	setTime(timeValue) {
		super.setTime(timeValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCDate()
	 */
	setUTCDate(dayValue) {
		super.setUTCDate(dayValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCFullYear()
	 */
	setUTCFullYear(yearValue, monthValue = null, dayValue = null) {
		super.setUTCFullYear(yearValue, monthValue, dayValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCHours()
	 */
	setUTCHours(hoursValue, minutesValue = null, secondsValue = null, msValue = null) {
		super.setUTCHours(hoursValue, minutesValue, secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCMilliseconds()
	 */
	setUTCMilliseconds(millisecondsValue) {
		super.setUTCMilliseconds(millisecondsValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCMinutes()
	 */
	setUTCMinutes(minutesValue, secondsValue = null, msValue = null) {
		super.setUTCMinutes(minutesValue, secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCMonth()
	 */
	setUTCMonth(monthValue, dayValue = null) {
		super.setUTCMonth(monthValue, dayValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setUTCSeconds()
	 */
	setUTCSeconds(secondsValue, msValue = null) {
		super.setUTCSeconds(secondsValue, msValue);
		this.#isUpdated = true;
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Date}::setYear()
	 */
	setYear(yearValue) {
		super.setYear(yearValue);
		this.#isUpdated = true;
	}

	/**
	 * verify if datetime has been updated
	 *
	 * @returns {boolean}
	 */
	isUpdated() {
		return this.#isUpdated;
	}

	/**
	 * reset updated status
	 */
	resetUpdatedStatus() {
		this.#isUpdated = false;
	}

}

export default ComhonDateTime;
