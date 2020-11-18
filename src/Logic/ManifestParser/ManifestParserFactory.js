/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ManifestParser_V_2_0 from 'Logic/ManifestParser/V_2_0/ManifestParser_V_2_0';
import ManifestParser_V_3_0 from 'Logic/ManifestParser/V_3_0/ManifestParser_V_3_0';
import ManifestParser from 'Logic/ManifestParser/ManifestParser';
import ManifestException from 'Logic/Exception/Manifest/ManifestException';

/**
 * @abstract
 */
class ManifestParserFactory {

	/**
	 * get manifest parser instance
	 *
	 * @param {*} manifest
	 * @param {string} namespace the name space to use for local types (equal to manifest model name)
	 * @throws {ComhonException}
	 * @returns ManifestParser
	 */
	static getInstance(manifest, namespace) {
		const interfacer = ManifestParser.getInterfacerInstance(manifest);

		if (!interfacer.hasValue(manifest, 'version')) {
			throw new ManifestException(`manifest '${namespace}' doesn't have version`);
		}
		const version = interfacer.getValue(manifest, 'version');
		switch (version) {
			case '2.0': return new ManifestParser_V_2_0(manifest, false, namespace);
			case '3.0': return new ManifestParser_V_3_0(manifest, false, namespace);
			default:    throw new ManifestException(`version ${version} not recognized for manifest ${namespace}`);
		}
	}

}

export default ManifestParserFactory;
