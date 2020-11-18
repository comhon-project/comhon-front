/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelForeign from 'Logic/Model/ModelForeign';
import ModelArray from 'Logic/Model/ModelArray';
import ForeignProperty from 'Logic/Model/Property/ForeignProperty';
import AggregationProperty from 'Logic/Model/Property/AggregationProperty';
import Property from 'Logic/Model/Property/Property';
import AutoProperty from 'Logic/Model/Property/AutoProperty';
import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import ManifestException from 'Logic/Exception/Manifest/ManifestException';
import ComhonException from 'Logic/Exception/ComhonException';

/**
 * @abstract
 */
class ManifestParser {

	/** @type {string} */
	static get _EXTENDS() {return 'extends';}

	/** @type {string} */
	static get IS_MAIN() {return 'is_main';}

	/** @type {string} */
	static get INHERITANCE_REQUESTABLES() {return 'inheritance_requestables';}

	/** @type {string} */
	static get NAME() {return 'name';}

	/** @type {string} */
	static get IS_ID() {return 'is_id';}

	/** @type {string} */
	static get IS_PRIVATE() {return 'is_private';}

	/** @type {string} */
	static get IS_FOREIGN() {return 'is_foreign';}

	/** @type {string} */
	static get IS_REQUIRED() {return 'is_required';}

	/** @type {string} */
	static get IS_ASSOCIATIVE() {return 'is_associative';}

	/** @type {string} */
	static get IS_ABSTRACT() {return 'is_abstract';}

	/** @type {string} */
	static get IS_ISOLATED() {return 'is_isolated';}

	/** @type {string} */
	static get DEPENDS() {return 'depends';}

	/** @type {string} */
	static get CONFLICTS() {return 'conflicts';}

	/** @type {string} */
	static get SHARE_PARENT_ID() {return 'share_parent_id';}

	/** @type {string} */
	static get SHARED_ID() {return 'shared_id';}

	/** @type {string} */
	static get XML_ELEM_TYPE() {return 'xml';}

	/** @type {string} */
	static get XML_NODE() {return 'node';}

	/** @type {string} */
	static get XML_ATTRIBUTE() {return 'attribute';}

	/** @type {string} */
	static get AUTO() {return 'auto';}

	/** @type {string} */
	static get AGGREGATIONS() {return 'aggregations';}

	// list of all restrictions

	/** @type {string} */
	static get ENUM() {return 'enum';}

	/** @type {string} */
	static get INTERVAL() {return 'interval';}

	/** @type {string} */
	static get PATTERN() {return 'pattern';}

	/** @type {string} */
	static get REGEX() {return 'regex';}

	/** @type {string} */
	static get NOT_NULL() {return 'not_null';}

	/** @type {string} */
	static get NOT_EMPTY() {return 'not_empty';}

	/** @type {string} */
	static get SIZE() {return 'size';}

	/** @type {string} */
	static get LENGTH() {return 'length';}

	/** @type {*} */
	#manifest;

	/** @type {Interfacer} */
	#interfacer;

	/** @type {boolean} */
	#castValues;

	/** @type {string} */
	#namespace;

	/** @type {boolean} */
	#isLocal;

	/** @type {array} */
	#currentProperties = null;

	/** @type {Iterator} */
	#propertiesIterator;

	/** @type {*} */
	#currentProperty;

	/**
	 * verify if manifest describe a main model.
	 * if true that means comhon object with described model might be stored in MainObjectCollection
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isMain() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get extends model names
	 *
	 * @abstract
	 * @returns {string[]|void} null if no extends model name
	 */
	getExtends() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get inherited model that are requestable
	 *
	 * @abstract
	 * @returns {string[]|void} null if no requestable inherited model
	 */
	getInheritanceRequestable() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if manifest describe a model is abstract.
	 * object with abstract model may be instanciated instanciated but cannot be loaded and cannot be interfaced
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isAbstract() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if manifest describe a model that share id with its direct parent model.
	 * if true, that mean it share id with first extends element.
	 * object with model that share id may be found in object collection with object model name or parent model name
	 *
	 * @abstract
	 * @returns {boolean}
	 */
	isSharedParentId() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if manifest describe a model that share id with any parent model and get its parent model name.
	 * object with model that share id may be found in object collection with object model name or parent model name
	 *
	 * @abstract
	 * @returns {string|void} if no model to share id with
	 */
	sharedId() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get manifest parsers that will permit to build all local models
	 *
	 * @abstract
	 * @returns ManifestParser[]
	 */
	getLocalModelManifestParsers() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get name of unique model of current property
	 *
	 * @abstract
	 * @returns {string}
	 */
	getCurrentPropertyModelUniqueName() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get current properties
	 *
	 * @abstract
	 * @returns {Array.}
	 */
	_getCurrentProperties() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get basic informations of property
	 *
	 * @abstract
	 * @param {Model|SimpleModel} propertyModelUnique unique model associated to property
	 * @param {Map<Promise>} patternPromises given Map will be populated if patterns found in manifest
	 * @returns [string, AbstractModel, boolean, boolean, boolean, boolean, boolean, boolean, string]
	 *     0 : property name
	 *     1 : final model associated to property
	 *     2 : true if property is id
	 *     3 : true if property is private
	 *     4 : true if property value must be not null
	 *     5 : true if property value is required
	 *     6 : true if property value is isolated
	 *     7 : true if property value is interfaced as node xml
	 *     8 : the method to auto generate property value
	 */
	_getBaseInfosProperty(propertyModelUnique, patternPromises) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get default value if exists
	 *
	 * @abstract
	 * @param {AbstractModel} propertyModel
	 * @returns {*} null if no default value
	 */
	_getDefaultValue(propertyModel) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get aggregation infos on current property
	 *
	 * @abstract
	 * @returns {string[]|void}
	 */
	_getAggregationInfos() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get properties values that MUST be set if current property value is set
	 *
	 * @abstract
	 * @returns {string[]} empty if there is no dependencies
	 */
	_getDependencyProperties() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get properties values that MUST NOT be set in same time
	 *
	 * @abstract
	 * @returns {string[]} empty if there is no conflict
	 */
	getConflicts() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * get Property/ComhonArray restrictions
	 *
	 * @abstract
	 * @param {*} currentNode
	 * @param {AbstractModel} propertyModel
	 * @param {Map<Promise>} patternPromises given Map will be populated if patterns found in manifest
	 * @returns {Restriction[]}
	 */
	_getRestrictions(currentNode, propertyModel, patternPromises) {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * verify if current property is foreign
	 *
	 * @abstract
	 */
	_isCurrentPropertyForeign() {
		throw new Error('function must be overridden in children class');
	}

	/**
	 * @param {*} manifest
	 * @param {boolean} isLocal
	 * @param {string} namespace
	 */
	constructor(manifest, isLocal, namespace) {
		if (this.constructor === ManifestParser) {
			throw new Error('can\'t instanciate abstract class ' + this.constructor.name);
		}
		this.#manifest = manifest;
		this.#isLocal = isLocal;
		this.#namespace = namespace;
		this.#interfacer = ManifestParser.getInterfacerInstance(this.getManifest());
		this.#castValues = (this.getInterfacer() instanceof XMLInterfacer);
	}

	/**
	 * verify if manifest is a local manifest
	 *
	 * @returns {boolean}
	 */
	isLocal() {
		return this.#isLocal;
	}

	/**
	 * get manifest
	 *
	 * @returns {*}
	 */
	getManifest() {
		return this.#manifest;
	}

	/**
	 * get namespace used for current manifest
	 *
	 * @returns {string}
	 */
	getNamespace() {
		return this.#namespace;
	}

	/**
	 * get interfacer that permit to parse manifest
	 *
	 * @returns {string}
	 */
	getInterfacer() {
		return this.#interfacer;
	}

	/**
	 * initialize current property node, and iterator to go through properties
	 *
	 * @private
	 */
	_initProperties() {
		this.#currentProperties = this._getCurrentProperties();
		this.#propertiesIterator = this.#currentProperties.values();
		if (this.#currentProperties.length > 0) {
			this.#currentProperty = this.#currentProperties[0];
			this.#propertiesIterator.next();
		}
	}

	/**
	 * go to next property
	 *
	 * @returns {boolean} false if there is no next property
	 */
	nextProperty() {
		if (this.#currentProperties === null) {
			this._initProperties();
		}
		const it = this.#propertiesIterator.next();
		this.#currentProperty = it.value;
		return !it.done;
	}

	/**
	 * get manifest current property node
	 *
	 * @returns {*}
	 */
	_getCurrentPropertyNode() {
		if (this.#currentProperties === null) {
			this._initProperties();
		}
		if (!this.#currentProperty) {
			throw new ComhonException('current property is out of range');
		}
		return this.#currentProperty;
	}

	/**
	 * get manifest current properties count
	 *
	 * @returns {integer}
	 */
	getCurrentPropertiesCount() {
		if (this.#currentProperties === null) {
			this._initProperties();
		}
		return this.#currentProperties.length;
	}

	/**
	 * get boolean value from manifest (cast if necessary)
	 *
	 * @param {*} node node
	 * @param {string} name value's name
	 * @param {boolean} defaultValue used if value not found
	 * @returns {boolean}
	 */
	_getBooleanValue(node, name, defaultValue) {
		return this.getInterfacer().hasValue(node, name)
			? (
				this.#castValues
					? this.getInterfacer().castValueToBoolean(this.getInterfacer().getValue(node, name))
					: this.getInterfacer().getValue(node, name)
			)
			: defaultValue;
	}

	/**
	 *
	 * @param {*} node the parent node
	 * @param {string} name property's name (foundable in parent node) wich value must be converted to array if necessary.
	 * @returns {string[]}
	 */
	_getPropertyArrayStringValue(node, name) {
		if (!this.getInterfacer().hasValue(node, name, true)) {
			return [];
		}
		return this._getArrayStringValue(this.getInterfacer().getValue(node, name, true));
	}

	/**
	 *
	 * @param {*} node the node that may be converted to array (typically if manifest is an XML).
	 * @returns {string[]}
	 */
	_getArrayStringValue(node) {
		if (!(this.getInterfacer() instanceof XMLInterfacer)) {
			return node;
		}
		const values = this.getInterfacer().nodeToArray(node);
		for (let i = 0; i < values.length; i++) {
			values[i] = this.getInterfacer().extractNodeText(values[i]);
		}

		return values;
	}

	/**
	 * get current property
	 *
	 * @param {Model|SimpleModel} propertyModelUnique unique model associated to property
	 * @param {Map<Promise>} patternPromises given Map will be populated if patterns found in manifest
	 * @throws {ComhonException}
	 * @returns {Property}
	 */
	getCurrentProperty(propertyModelUnique, patternPromises) {
		let property, name, model, isId, isPrivate, isNotNull, isRequired, isIsolated, interfaceAsNodeXml, auto;
		[name,
			model,
			isId,
			isPrivate,
			isNotNull,
			isRequired,
			isIsolated,
			interfaceAsNodeXml,
			auto
		] = this._getBaseInfosProperty(propertyModelUnique, patternPromises);
		const dependencies = this._getDependencyProperties();

		if (this._isCurrentPropertyForeign()) {
			const modelForeign = new ModelForeign(model);
			let aggregations = null;
			if ((model instanceof ModelArray) && model.getDimensionsCount() === 1) {
				aggregations = this._getAggregationInfos();
			}
			if (aggregations === null) {
				property = new ForeignProperty(modelForeign, name, isPrivate, isRequired, isNotNull, dependencies);
			} else {
				property = new AggregationProperty(modelForeign, name, aggregations, isPrivate, dependencies);
			}
		}
		else {
			const defaultValue = this._getDefaultValue(model);
			const restrictions = this._getRestrictions(this._getCurrentPropertyNode(), model, patternPromises);

			if (auto === null) {
				property = new Property(model, name, isId, isPrivate, isRequired, isNotNull, defaultValue, interfaceAsNodeXml, restrictions, dependencies, isIsolated);
			} else {
				property = new AutoProperty(model, name, isId, isPrivate, isRequired, interfaceAsNodeXml, dependencies, auto);
			}
		}
		return property;
	}

	/**
	 * get interfacer able to parse manifest
	 *
	 * @param {*} manifest
	 * @returns {Interfacer}
	 */
	static getInterfacerInstance(manifest) {
		if (manifest instanceof Element) {
			return new XMLInterfacer();
		}
		if (typeof manifest === 'object' && manifest !== null) {
			return new ObjectInterfacer();
		}
		throw new ManifestException('not recognized manifest format');
	}

}

export default ManifestParser;
