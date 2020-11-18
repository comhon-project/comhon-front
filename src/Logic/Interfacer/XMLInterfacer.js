/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Interfacer from 'Logic/Interfacer/Interfacer';
import ArgumentException from 'Logic/Exception/ArgumentException';
import ComhonException from 'Logic/Exception/ComhonException';
// import xmlFormat from 'xml-formatter'; 1 vulnerabilty when install this pakage

const NS_XSI = 'xmlns:xsi';
const NS_NULL_VALUE = 'xsi:nil';
const NULL_VALUE = 'nil';
const NIL_URI = 'http://www.w3.org/2001/XMLSchema-instance';

class XMLInterfacer extends Interfacer {

	/** @type {DOMDocument} */
	#domDocument;

	constructor() {
		super();
		this.#domDocument = document.implementation.createDocument(null, null);
		this.#domDocument.preserveWhiteSpace = false;
	}

	/**
	 * get child node with name name (if several children have same name, the first one is returned).
	 *
	 * @private
	 * @param {Element} node
	 * @param {string} name
	 * @returns {Element|void} null if doesn't exist
	 */
	_getChildNode(node, name) {
		for (const child of node.childNodes) {
			if (child.nodeName === name) {
				return child;
			}
		}
		return null;
	}

	/**
	 * add attribute namespace URI for null values.
	 *
	 * @param {Element} node
	 */
	addNullNamespaceURI(node) {
		if (node.hasAttribute(NS_XSI)) {
      return;
    }
    node.setAttributeNode(node.ownerDocument.createAttributeNS(NIL_URI, NS_NULL_VALUE));
	}

	/**
	 * add attribute namespace xsi:nil on given node
	 *
	 * @param {Element} node
	 */
	setNodeAsNull(node) {
		node.setAttributeNS(NIL_URI, NULL_VALUE, 'true');
	}

	/**
	 * Dumps the internal XML tree back into a string
	 *
	 * @private
	 * @param {Element} node
	 * @param {boolean} prettyPrint
	 * @returns {false|string}
	 */
	_saveXML(node, prettyPrint) {
		const serializer = new XMLSerializer();
		// return prettyPrint ? xmlFormat(serializer.serializeToString(node)) : serializer.serializeToString(node);
		return serializer.serializeToString(node);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Interfacer}::getMediaType()
	 */
	getMediaType() {
		return 'application/xml';
	}

	/**
	 * get value in node with attribute or node name according asNode
	 *
	 * @param {Element} node
	 * @param {string} name
	 * @param {boolean} asNode if true search value in nodes otherwise search in attributes
	 * @returns {Element|string|void} null if doesn't exist
	 */
	getValue(node, name, asNode = false) {
		if (asNode) {
			let childNode = this._getChildNode(node, name);
			if ((childNode !== null) && this.isNodeNull(childNode)) {
				childNode = null;
			}
			return childNode;
		} else if (node.hasAttribute(name)) {
			return node.getAttribute(name);
		}
		return null;
	}

	/**
	 * verify if node is null (i.e. if has attribute xsi:nil="true")
	 *
	 * @param {Element} node
	 * @returns {boolean}
	 */
	isNodeNull(node) {
		return node.hasAttributeNS(NIL_URI, NULL_VALUE);
	}

	/**
	 * verify if node contain value with attribute or node name according asNode
	 *
	 * @param {Element} node
	 * @param {string} name
	 * @param {boolean} asNode if true search value in nodes otherwise search in attributes
	 * @returns {boolean}
	 */
	hasValue(node, name, asNode = false) {
		return asNode ?
			(this._getChildNode(node, name) !== null)
			: node.hasAttribute(name);
	}

	/**
	 * verify if value is null
	 *
	 * values considered as null are :
	 *     - null
	 *     - Element with attribute xsi:nil="true"
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNullValue(value) {
		return (value instanceof Element) ? this.isNodeNull(value) : (value === null);
	}

	/**
	 * transform given Element to array, each child Element become an array element
	 *
	 * @param {Element} node
	 * @returns {Element[]}
	 */
	nodeToArray(node) {
		if (!(node instanceof Element)) {
			throw new ArgumentException(node, 'Element', 1);
		}
		const array = [];
		for (const domNode of node.childNodes) {
			if (domNode instanceof Element) {
					array.push(domNode);
			}
		}
		return array;
	}

	/**
	 * transform given Element to Object, each child Element become an object value.
	 * each property name of created object is the name of child Element.
	 *
	 * @param {Element} node
	 * @returns {Object}
	 */
	nodeToObject(node) {
		if (!(node instanceof Element)) {
			throw new ArgumentException(node, 'Element', 1);
		}
		const object = {};
		for (const domNode of node.childNodes) {
			if (domNode instanceof Element) {
				if (!domNode.hasAttribute(Interfacer.ASSOCIATIVE_KEY)) {
						throw new ArgumentException(node, 'Element', 1);
				}
				if (domNode.getAttribute(Interfacer.ASSOCIATIVE_KEY) in object) {
					throw new ComhonException(`duplicated key '${domNode.getAttribute(Interfacer.ASSOCIATIVE_KEY)}'`);
				}
				object[domNode.getAttribute(Interfacer.ASSOCIATIVE_KEY)] = domNode;
			}
		}
		return object;
	}

	/**
	 * get child nodes names that are null
	 *
	 * @param {Element} node
	 * @returns {string[]}
	 */
	getNullNodes(node) {
		const array = [];
		for (const domNode of node.childNodes) {
			if (domNode instanceof Element && this.isNodeNull(domNode)) {
				array.push(domNode.nodeName);
			}
		}
		return array;
	}

	/**
	 * verify if value is a DOM Element
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isNodeValue(value) {
		return (value instanceof Element);
	}

	/**
	 * verify if value is a DOM Element
	 *
	 * @param {*} value
	 * @param {boolean} isAssociative
	 * @returns {boolean}
	 */
	isArrayNodeValue(value, isAssociative) {
		return (value instanceof Element);
	}

	/**
	 * verify if value is a complex id (with inheritance key) or a simple value
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isComplexInterfacedId(value) {
		return (value instanceof Element) && value.hasAttribute(Interfacer.COMPLEX_ID_KEY);
	}

	/**
	 * verify if value is a flatten complex id (with inheritance key)
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	isFlattenComplexInterfacedId(value) {
		return this.isComplexInterfacedId(value);
	}

	/**
	 * Set value in node with attribute or node name according asNode.
	 *
	 * Warning! if value is a DomNode and doesn't belong to same DomDocument than node,
	 * value is copied and the copy is set on node.
	 * So modify value later will not modify set value.
	 *
	 * Warning! if you set a null value as node,
	 * parent node (direct or not) must be in null namespace (see XMLInterfacer.addNullNamespaceURI).
	 * otherwise when you will stringify xml, null value will be invalid.
	 *
	 * @param {Element} node
	 * @param {*} value if scalar value, set attribute. else if DOM Element, append child
	 * @param {string} name used only if value if scalar value
	 * @param {boolean} asNode if true add node otherwise add attribute
	 *     used only if value if scalar value
	 */
	setValue(node, value, name = null, asNode = false) {
		if (!(node instanceof Element)) {
			throw new ArgumentException(node, 'Element', 1);
		}
		if (value instanceof Node) {
			if (node.ownerDocument !== value.ownerDocument) {
				value = node.ownerDocument.importNode(value, true);
			}
			node.appendChild(value);
		} else {
			if (asNode) {
				const childNode = node.appendChild(node.ownerDocument.createElement(name));
				if (value === null) {
					this.setNodeAsNull(childNode);
				} else {
					childNode.appendChild(childNode.ownerDocument.createTextNode(value));
				}
			} else {
				if (value === null) {
					const childNode = node.appendChild(node.ownerDocument.createElement(name));
					this.setNodeAsNull(childNode);
				} else {
					node.setAttribute(name, value);
				}
			}
		}
	}

	/**
	 * unset value in node with attribute or node name according asNode
	 *
	 * @param {Element} node
	 * @param {string} name
	 * @param {boolean} asNode if true search value in nodes otherwise search in attributes
	 */
	unsetValue(node, name, asNode = false) {
		if (asNode) {
			const domElement= this._getChildNode(node, name);
			if (domElement !== null) {
				node.removeChild(domElement);
			}
		} else {
			node.removeAttribute(name);
		}
	}

	/**
	 * add value to node
	 *
	 * @param {Element} node
	 * @param {Node} value
	 * @param {string} name used only if value if scalar value
	 */
	addValue(node, value, name = null) {
		this.setValue(node, value, name, true);
	}

	/**
	 * add value to node
	 *
	 * @param {Element} node
	 * @param {Node} value
	 * @param {string} key
	 * @param {string} name node name to add. must be provided if value if scalar value.
	 */
	addAssociativeValue(node, value, key, name = null) {
		this.setValue(node, value, name, true);
		this.setValue(node.lastChild, key, Interfacer.ASSOCIATIVE_KEY);
	}

	/**
	 * create DOM Element node
	 *
	 * @param {string} name
	 * @returns {Element}
	 */
	createNode(name = null) {
		if (name === null) {
			throw new ArgumentException(name, 'string', 1);
		}
		return this.#domDocument.createElement(name);
	}

	/**
	 * {@inheritDoc}
	 * @see {Interfacer}::getNodeClasses()
	 */
	getNodeClasses() {
		return ['Node'];
	}

	/**
	 * create DOM Element node
	 *
	 * @param {string} name
	 * @returns {Element}
	 */
	createArrayNode(name = null) {
		return this.createNode(name);
	}

	/**
	 * {@inheritDoc}
	 * @see {Interfacer}::getArrayNodeClasses()
	 */
	getArrayNodeClasses() {
		return ['Node'];
	}

	/**
	 * transform given node to string
	 *
	 * @param {Element} node
	 * @param {boolean} prettyPrint
	 * @returns {string}
	 */
	toString(node, prettyPrint = false) {
		return this._saveXML(node, prettyPrint);
	}

	/**
	 *
	 * {@inheritDoc}
	 * @see {Interfacer}::fromString()
	 */
	fromString(string) {
		try {
			const parser = new DOMParser();
			const domDoc = parser.parseFromString(string, "application/xml");
			if (!domDoc) {
				return null;
			}
			if (domDoc.childNodes.length !== 1 || !(domDoc.childNodes.item(0) instanceof Element)) {
				console.log('wrong xml, XMLInterfacer manage only xml with one and only one root node');
				return null;
			}
			return this.#domDocument.importNode(domDoc.childNodes.item(0), true);
		} catch (e) {
			return null;
		}
	}

	/**
	 * flatten value (transform object/array to string)
	 *
	 * @param {Element} node
	 * @param {string} name
	 */
	flattenNode(node, name) {
		const  domElement = this._getChildNode(node, name);
		if (domElement !== null) {
			let string = '';
			const toRemove = [];
			for (const child of domElement.childNodes) {
				toRemove.push(child);
				string += this._saveXML(child, false);
			}
			for (const child of toRemove) {
				domElement.removeChild(child);
			}
			domElement.appendChild(domElement.ownerDocument.createTextNode(string));
		}
	}

	/**
	 * unflatten value (transform string to object)
	 *
	 * @param {array} node
	 * @param {string} name
	 */
	unFlattenNode(node, name) {
		const domElement = this._getChildNode(node, name);
		if ((domElement !== null) && this.extractNodeText(domElement) !== '') {
			const parser = new DOMParser();
			const tempDoc = parser.parseFromString('<temp>' + this.extractNodeText(domElement) + '</temp>',"application/xml");

			if (tempDoc.childNodes.length !== 1 || !(tempDoc.childNodes.item(0) instanceof Element)) {
				throw new ComhonException('wrong xml, XMLInterfacer manage xml with one and only one root node');
			}
			const toRemove = [];
			for (const child of domElement.childNodes) {
				toRemove.push(child);
			}
			for (const child of toRemove) {
				domElement.removeChild(child);
			}
			for (const child of tempDoc.childNodes.item(0).childNodes) {
				domElement.appendChild(this.#domDocument.importNode(child, true));
			}
		}
	}

	/**
	 * replace value in node name by value (fail if node name doesn't exist)
	 *
	 * @param {Element} node
	 * @param {string} name
	 * @param {*} value
	 */
	replaceValue(node, name, value) {
		const domElement = this._getChildNode(node, name);
		if (domElement !== null) {
			node.removeChild(domElement);
			this.setValue(node, value, name, true);
		}
	}

	/**
	 * extract text from node
	 *
	 * @param {Element} node
	 * @returns {string|void}
	 */
	extractNodeText(node) {
		if (this.isNodeNull(node)) {
			return null;
		}
		if (node.childNodes.length !== 1) {
			throw new ComhonException('malformed node, should only contain one text');
		}
		if (node.childNodes.item(0).nodeType !== 3) { // 3 correspond to text node
			throw new ComhonException('malformed node, should only contain one text');
		}
		return node.childNodes.item(0).nodeValue;
	}

}

export default XMLInterfacer;
