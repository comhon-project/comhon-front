/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import XMLInterfacer from 'Logic/Interfacer/XMLInterfacer';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import ArgumentException from 'Logic/Exception/ArgumentException';

/**
 * @abstract
 */
class InterfacerFactory {

	/**
	 *
	 * @param {string} format must be one of [xml, json, application/json, application/xml]
	 */
	static getInstance(format) {
		switch (format) {
			case 'xml':
			case 'application/xml':
				return new XMLInterfacer();
			case 'json':
			case 'application/json':
			// case 'yaml':
			// case 'application/x-yaml':
				return new ObjectInterfacer(format);
			default:
				throw new ArgumentException(format, 'string', 1, ['json', 'application/json', 'xml', 'application/xml'/*, 'yaml', 'application/x-yaml'*/]);
		}
	}

}

export default InterfacerFactory;
