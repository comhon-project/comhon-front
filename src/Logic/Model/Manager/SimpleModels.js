/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ModelInteger from 'Logic/Model/ModelInteger';
import ModelFloat from 'Logic/Model/ModelFloat';
import ModelBoolean from 'Logic/Model/ModelBoolean';
import ModelString from 'Logic/Model/ModelString';
import ModelPercentage from 'Logic/Model/ModelPercentage';
import ModelIndex from 'Logic/Model/ModelIndex';
import ModelDateTime from 'Logic/Model/ModelDateTime';

const simpleModels = {
  [ModelInteger.ID]    : new ModelInteger(),
  [ModelFloat.ID]      : new ModelFloat(),
  [ModelBoolean.ID]    : new ModelBoolean(),
  [ModelString.ID]     : new ModelString(),
  [ModelIndex.ID]      : new ModelIndex(),
  [ModelPercentage.ID] : new ModelPercentage(),
  [ModelDateTime.ID]   : new ModelDateTime()
};
Object.freeze(simpleModels);

export default simpleModels;
