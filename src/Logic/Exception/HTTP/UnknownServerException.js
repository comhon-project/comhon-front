/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class UnknownServerException extends ComhonException {

  constructor() {
    super('unknown server error (maybe server is not reachable)');
  }

}

export default UnknownServerException;
