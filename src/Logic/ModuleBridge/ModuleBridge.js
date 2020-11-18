/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * model bridge permit to store some modules to avoid import loop
 */
class ModuleBridge {

	#modelRootInstance = null;

	#objectFinder = null;

	/**
	 * register ModelRoot
	 *
	 * @param {ModelRoot} modelRootInstance
	 */
	registerModelRoot(modelRootInstance) {
		if (modelRootInstance === null || typeof modelRootInstance !== 'object' || modelRootInstance.constructor.name !== 'ModelRoot') {
			throw new Error('invalid ModelRoot instance');
		}
	this.#modelRootInstance = modelRootInstance;
	}

	/**
	 * get ModelRoot
	 *
	 * @returns {ModelRoot|void}
	 */
	getModelRoot() {
		return this.#modelRootInstance;
	}

	/**
	 * register ModelRoot
	 *
	 * @param {ModelRoot} modelRootInstance
	 */
	registerObjectFinder(objectFinder) {
		this.#objectFinder = objectFinder;
	}

	/**
	 * get ModelRoot
	 *
	 * @returns {ModelRoot|void}
	 */
	getObjectFinder() {
		return this.#objectFinder;
	}

}

export default new ModuleBridge();
