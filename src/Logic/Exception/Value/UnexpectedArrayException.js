/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import UnexpectedValueTypeException from 'Logic/Exception/Value/UnexpectedValueTypeException';
import ConstantException from 'Logic/Exception/ConstantException';

class UnexpectedArrayException extends UnexpectedValueTypeException {

	/** @type {ModelArray} */
	#modelArray;

	/** @type {integer} */
	#depth;

	/**
	 *
	 * @param {ComhonArray} objectArray
	 * @param {ModelArray} modelArray
	 * @param {integer} depth
	 */
	constructor(objectArray, modelArray, depth) {
		let message = '';
		let part;
		let objectModel = objectArray.getModel();
		if (depth > 0 && objectArray.getClassName() === 'ComhonArray') {
			objectModel = objectModel.getModel(depth - 1);
		}

		if (objectModel.getClassName() !== 'ModelArray') {
			message = `model must be a ModelArray, model '${objectModel.getName()}' given. `;
		} else if (modelArray.isAssociative() !== objectModel.isAssociative()) {
			part = modelArray.isAssociative() ? 'must be' : 'must not be';
			message = `ModelArray ${part} associative. `;
		} else if (modelArray.getElementName() !== objectModel.getElementName()) {
			message = `ModelArray element name must be '${modelArray.getElementName()}', '${objectModel.getElementName()}' given. `;
		} else if (modelArray.isNotNullElement() !== objectModel.isNotNullElement()) {
			part = modelArray.isNotNullElement() ? 'must have' : 'must not have';
			message = `ModelArray ${part} not null element. `;
		} else if (modelArray.isIsolatedElement() !== objectModel.isIsolatedElement()) {
			part = modelArray.isNotNullElement() ? 'must be' : 'must not be';
			message = `ModelArray ${part} isolated element. `;
		} else if ((objectModel.getModel().getClassName() !== 'Model') || !UnexpectedArrayException._isInerited(objectModel, modelArray)) {
			const trustModelName = modelArray.getModelName();
			const objectModelName = objectModel.getModel().getClassName() === 'ModelArray'
				? 'ModelArray' : `'${objectModel.getModel().getName()}'`;
			message = `model must be a '${trustModelName}', model '${objectModelName}' given. `;
		} else {
			let expectedRestriction = '';
			for (const restriction of modelArray.getArrayRestrictions()) {
				expectedRestriction += ' - ' + restriction.toString() + '(on comhon array)\n';
			}
			for (const restriction of modelArray.getElementRestrictions()) {
				expectedRestriction += ' - ' + restriction.toString() + '(on elements)\n';
			}
			let actualRestriction = '';
			if (objectArray.getModel() instanceof modelArray ) {
				for (const restriction of objectArray.getModel().getArrayRestrictions()) {
					actualRestriction += ' - ' + restriction.toString() + '(on comhon array)\n';
				}
				for (const restriction of objectArray.getModel().getElementRestrictions()) {
					actualRestriction += ' - ' + restriction.toString() + '(on elements)\n';
				}
			}

			message = `value ${objectArray.getClassName()} must have restrictions :\n`
				+ expectedRestriction
				+ "restrictions given : \n"
				+ actualRestriction;
		}
		if (depth > 0) {
			message += 'array depth : ' + depth;
		}

		super(message, ConstantException.UNEXPECTED_VALUE_TYPE_EXCEPTION);
		this.#modelArray = modelArray;
		this.#depth = depth;
	}

	/**
	 *
	 * @param {Model} objectModel
	 * @param {ModelArray} modelArray
	 * @returns {boolean}
	 */
	static _isInerited(objectModel, modelArray) {
		try {
			const model = modelArray.getLoadedModel();
			return objectModel.getModel().isInheritedFrom(model);
		} catch (e) {
			return false;
		}
	}

	/**
	 *
	 * @returns {ModelArray}
	 */
	getModelArray() {
		return this.#modelArray;
	}

	/**
	 *
	 * @returns {integer}
	 */
	getDepth() {
		return this.#depth;
	}

}

export default UnexpectedArrayException;
