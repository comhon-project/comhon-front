/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelFloat from 'Logic/Model/ModelFloat';

class ModelPercentage extends ModelFloat {

	/** @type {string} */
	static get ID() {return 'percentage';}

	constructor() {
		super(ModelPercentage.ID);
	}

}

export default ModelPercentage;
