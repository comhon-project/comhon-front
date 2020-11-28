/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractModel from 'Logic/Model/AbstractModel';
import ComhonException from 'Logic/Exception/ComhonException';
import ObjectCollectionInterfacer from 'Logic/Object/Collection/ObjectCollectionInterfacer';
import InterfaceException from 'Logic/Exception/Interfacer/InterfaceException';
import NotReferencedValueException from 'Logic/Exception/Interfacer/NotReferencedValueException';
import ExportException from 'Logic/Exception/Interfacer/ExportException';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import Interfacer from 'Logic/Interfacer/Interfacer';
import ModuleBridge from 'Logic/ModuleBridge/ModuleBridge';

/**
 * @abstract
 */
class ModelComplex extends AbstractModel {

	constructor() {
		super();
		if (this.constructor === ModelComplex) {
			throw new Error('can\'t instanciate abstract class ModelComplex');
		}
  }

	/**
	 *
	 * {@inheritDoc}
	 * @see {AbstractModel}::isComplex()
	 */
	isComplex() {
		return true;
	}

	/**
	 *
	 * @param {ComhonObject} object
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @throws {ComhonException}
	 */
	_verifyReferences(object, objectCollectionInterfacer) {
		const objects = objectCollectionInterfacer.getNotReferencedObjects();
		if (objects.length > 0) {
			const ObjectFinder = ModuleBridge.getObjectFinder();
			if (ObjectFinder === null) {
				throw new Error('ObjectFinder has not been registered');
			}
			const objectFinder = new ObjectFinder();
			for (const obj of objects) {
				const statck = objectFinder.execute(
					object,
					{
						[ObjectFinder.ID] : obj.getId(),
						[ObjectFinder.MODEL] : obj.getModel(),
						[ObjectFinder.SEARCH_FOREIGN] : true
					}
				);
				if (statck === null) {
					throw new ComhonException('value should not be null');
				}
				// for the moment InterfaceException manage only one error
				// so we throw exception at the first loop
				throw InterfaceException.getInstanceWithProperties(
					new NotReferencedValueException(obj),
					statck.reverse()
				);
			}
		}
	}

	/**
	 * export comhon object in specified format
	 *
	 * @param {AbstractComhonObject} object
	 * @param {Interfacer} interfacer
	 * @param {boolean} forceIsolateElements this parameter is only use if exported object is a comhon array.
	 *                force isolate each elements of comhon array
	 *                (isolated element doesn't share objects instances with others elements).
	 * @returns {*}
	 */
	export(object, interfacer, forceIsolateElements = true) {
		try {
			this.verifValue(object);
			const objectCollectionInterfacer = new ObjectCollectionInterfacer();
			const nullNodes = interfacer instanceof XMLInterfacer ? [] : null;
			const isolate = forceIsolateElements && (object.getClassName() === 'ComhonArray');
			const oids = {};
			const node = this._export(object, 'root', interfacer, true, objectCollectionInterfacer, nullNodes, oids, isolate);
			// cannot use !(this instanceof ModelForeign)
			// because ModelForeign import make this class loading fail
			// certainly due to a kind of import loop
			if (interfacer.hasToVerifyReferences() && (this.getClassName() !== 'ModelForeign')) {
				this._verifyReferences(object, objectCollectionInterfacer);
			}
			if (nullNodes !== null && nullNodes.length > 0) { // if not empty, interfacer must be xml interfacer
				this._processNullNodes(interfacer, node, nullNodes);
			}
			return node;
		} catch (e) {
			throw new ExportException(e);
		}
	}

	/**
	 * add null namespace on given root element and flag given nodes as null
	 *
	 * @private
	 * @param XMLInterfacer interfacer
	 * @param {Element} rootNode
	 * @param {Element[]} nullNodes
	 */
	_processNullNodes(interfacer, rootNode, nullNodes) {
		interfacer.addNullNamespaceURI(rootNode);
		for (const nullNode of nullNodes) {
			interfacer.setNodeAsNull(nullNode);
		}
	}

	/**
	 * export comhon object id(s)
	 *
	 * @abstract
	 * @param {AbstractComhonObject} object
	 * @param {string} nodeName
	 * @param {Interfacer} interfacer
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @param {Element[]} nullNodes nodes that need to be processed at the end of export (only used for xml export).
	 * @throws {ComhonException}
	 * @returns {*|void}
	 */
	_exportId(object, nodeName, interfacer, objectCollectionInterfacer, nullNodes) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * import interfaced object
	 *
	 * @async
	 * @abstract
	 * @param {*} interfacedValue
	 * @param {Interfacer} interfacer
	 * @throws {ComhonException}
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async import(interfacedValue, interfacer) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * create or get comhon object according interfaced id
	 *
	 * @async
	 * @abstract
	 * @param {*} interfacedId
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async _importId(interfacedId, interfacer, isFirstLevel, objectCollectionInterfacer) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * import interfaced object
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {AbstractComhonObject} rootObject
	 * @param {boolean} isolate determine if root comhon array elements must be isolated.
	 *                         this parameter may by true only if the imported root object is a comhon array
	 *                         and if the parameter forceIsolateElements is set to true.
	 * @throws {ComhonException}
	 * @returns {AbstractComhonObject}
	 */
	async _importRoot(interfacedObject, interfacer, rootObject = null, isolate = false) {
 		const mergeType = interfacer.getMergeType();

 		if (rootObject === null) {
 			rootObject = await this._getRootObject(interfacedObject, interfacer);
 		}

		// TODO (perhaps) to increase performances, visit interfacedObject to retrieve all models
		//        that will be used during import and that are not loaded
		//        to load them in same time with "await Promise.all()".
		//      should increase perfs first time but for several imports, if all models are already loaded
		//        does it have a significant cost to visit interfacedObject for nothing?

 		const objectCollectionInterfacer = this._initObjectCollectionInterfacer(rootObject, mergeType);

 		if (interfacer.getMergeType() === Interfacer.OVERWRITE || this.getClassName() === 'ModelArray') {
 			const isLoaded = rootObject.isLoaded();
 			rootObject.reset(false);
 			rootObject.setIsLoaded(isLoaded);
 		}
 		await this._fillObject(
 			rootObject,
 			interfacedObject,
 			interfacer,
 			true,
 			objectCollectionInterfacer,
 			isolate
 		);

 		if (interfacer.hasToVerifyReferences()) {
 			this._verifyReferences(rootObject, objectCollectionInterfacer);
 		}

 		return rootObject;
 	}

	/**
	 * get root object instance
	 *
	 * @async
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @returns {Promise<ComhonObject|ComhonArray>}
	 */
	async _getRootObject(interfacedObject, interfacer) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 *
	 * @param {ComhonObject|ComhonArray} objectArray
	 * @param {string} mergeType
	 * @returns {ObjectCollectionInterfacer}
	 */
	_initObjectCollectionInterfacer(object, mergeType) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * fill comhon object (or comhon array) with values from interfaced object
	 *
	 * @async
	 * @param {AbstractComhonObject} object
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @param {boolean} isFirstLevel
	 * @param {ObjectCollectionInterfacer} objectCollectionInterfacer
	 * @param {boolean} isolate determine if root comhon array elements must be isolated.
	 *                         this parameter may by true only if the imported root object is a comhon array
	 *                         and if the parameter forceIsolateElements is set to true.
	 * @throws {ImportException}
	 */
	async _fillObject(
		object,
		interfacedObject,
		interfacer,
		isFirstLevel,
		objectCollectionInterfacer,
		isolate = false
	) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * fill comhon object with values from interfaced object
	 *
	 * @async
	 * @abstract
	 * @param {AbstractComhonObject} object
	 * @param {*} interfacedObject
	 * @param {Interfacer} interfacer
	 * @throws {ComhonException}
	 * @returns {Promise<void>}
	 */
	async fillObject(object, interfacedObject, interfacer) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get instance of object associated to model
	 *
	 * @abstract
	 * @param {boolean} isloaded define if instanciated object will be flagged as loaded or not
	 * @returns {ComhonObject|ComhonArray}
	 */
	getObjectInstance(isloaded = true) {
		throw new Error('function must be overridden in children class');
	}

}

export default ModelComplex;
