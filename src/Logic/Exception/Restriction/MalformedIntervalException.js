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

class MalformedIntervalException extends ComhonException {

	/**
	 * @param {string} interval
	 */
	constructor(interval) {
		super(`interval '${interval}' not valid`, ConstantException.MALFORMED_INTERVAL_EXCEPTION);
	}

}

export default MalformedIntervalException;
