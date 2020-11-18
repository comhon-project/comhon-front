/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';

class HTTPException extends ComhonException {

  /**
   *
   * @param {XMLHttpRequest} xhr
   * @param {string} message
   */
  constructor(xhr, message = '') {
    super(message === '' ? xhr.responseText : message, xhr.status);
  }

}

export default HTTPException;
