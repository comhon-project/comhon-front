/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';
import ConstantException from 'Logic/Exception/ConstantException';

class ManifestException extends ComhonException {

	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, ConstantException.MANIFEST_EXCEPTION);
	}

}

export default ManifestException;
