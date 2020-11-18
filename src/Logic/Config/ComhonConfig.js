/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class ComhonConfig {

  #baseURI = null;


  #tokenType = null;

  /**
   * @param {Object} config some configurations
   * @param {string} config.baseURI the base URI used with ComhonRequest
   */
  initialize(config) {
    if (config.baseURI) {
      this.#baseURI = config.baseURI;
    }
  }

  /**
   * @return {boolean}
   */
  hasBaseURI() {
    return this.#baseURI !== null && this.#baseURI !== '';
  }

  /**
   * @return {string|void}
   */
  getBaseURI() {
    return this.#baseURI;
  }

}

export default new ComhonConfig();
