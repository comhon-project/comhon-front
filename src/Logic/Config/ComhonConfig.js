/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Requester from 'Logic/Requester/ComhonRequester';

class ComhonConfig {

  #basePathURI = null;


  #tokenType = null;

  /**
   * @param {Object} config some configurations
   * @param {string} config.basePathURI the base URI used with ComhonRequest
   */
  initialize(config) {
    if (config.basePathURI) {
      this.#basePathURI = config.basePathURI;
      Requester.registerBasePath(this.#basePathURI);
    }
  }

  /**
   * @return {boolean}
   */
  hasbasePathURI() {
    return this.#basePathURI !== null && this.#basePathURI !== '';
  }

  /**
   * @return {string|void}
   */
  getbasePathURI() {
    return this.#basePathURI;
  }

}

export default new ComhonConfig();
