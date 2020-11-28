/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

 import ModelComplex from 'Logic/Model/ModelComplex';
 import SimpleModel from 'Logic/Model/SimpleModel';
 import ComhonException from 'Logic/Exception/ComhonException';

/**
 * @abstract
 */
class ModelContainer extends ModelComplex {

	/**
	 * @type {AbstractModel} model of object array elements
	 */
	#model;

	/**
	 * @param {AbstractModel} model contained model
	 */
	constructor(model) {
    super();
		if (this.constructor === ModelContainer) {
			throw new Error('can\'t instanciate abstract class ModelContainer');
		}
		this.#model = model;
	}

	/**
	 * get contained model.
   * DON'T use this function because model may be not loaded.
	 * instead you must call getModel().
	 *
	 * @returns {Model|ModelArray|SimpleModel}
	 */
	_getModel() {
		return this.#model;
	}

	/**
	 * get contained model
	 *
   * @async
	 * @returns {Promise<Model|ModelArray|SimpleModel>}
	 */
	async getModel() {
		await this.#model.load();
		return this.#model;
	}

	/**
	 * get contained model name
	 *
	 * @returns {string|void} returns null if contained model is a model container.
	 */
	getModelName() {
		return this.#model.getName();
	}

	/**
	 * get unique contained model
	 *
	 * a model container may contain another container so this function permit to
	 * get the final unique model that is not a container
	 *
   * @async
	 * @returns {Promise<Model|SimpleModel>}
	 */
	async getUniqueModel() {
		let model = this.#model;
		while (model instanceof ModelContainer) {
			model = model.#model;
		}
  	await model.load();
		return model;
	}

	/**
	 * get unique contained model name
	 *
	 * a model container may contain another container so this function permit to
	 * get the final unique model name that is not a container
	 *
	 * @returns {string}
	 */
	getUniqueModelName() {
		let model = this.#model;
		while (model instanceof ModelContainer) {
			model = model.#model;
		}
		return model.getName();
	}

	/**
	 * get unique contained loaded model.
	 *
	 * a model container may contain another container so this function permit to
	 * get the final unique model that is not a container.
   * if unique model is not loaded an exception is thrown.
	 *
	 * @returns {Model|SimpleModel}
	 */
	getLoadedUniqueModel() {
		let model = this.#model;
		while (model instanceof ModelContainer) {
			model = model.#model;
		}
    if (!model.isLoaded()) {
      throw new ComhonException('unique model not loaded')
    }
		return model;
	}

	/**
	 * get contained loaded model.
	 *
	 * a model container may contain another container so this function permit to get a model at given depth.
	 * if the model at given depth is a unique model and is not loaded, an exception is thrown.
	 *
	 * @param {integer} depth
	 * @returns {Model|SimpleModel}
	 */
	getLoadedModel(depth = 0) {
		let model = this.#model;
		while ((depth > 0) && (model instanceof ModelContainer)) {
			model = model.#model;
      depth--;
		}
    if (depth > 0) {
      throw new ComhonException('invalid depth (out of range)');
    }
    if (!model.isLoaded()) {
      throw new ComhonException('model not loaded')
    }
		return model;
	}

	/**
	 * verify unique model inside model container is a simple model
	 *
	 * @returns {boolean}
	 */
	isUniqueModelSimple() {
		return this.#model instanceof ModelContainer
			? this.#model.isUniqueModelSimple()
			: this.#model instanceof SimpleModel;
	}

	/**
	 * verify if specified model is equal to this model container
	 *
	 * verify if model are same instance or if they have same contained model
	 *
	 * @param AbstractModel model
	 * @returns {boolean}
	 */
	isEqual(model) {
		return super.isEqual(model) || ((this.constructor.name === model.constructor.name) && this.#model.isEqual(model.#model));
	}

}

export default ModelContainer;
