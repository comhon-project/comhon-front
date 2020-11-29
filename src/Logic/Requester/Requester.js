/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import UnknownServerException from 'Logic/Exception/HTTP/UnknownServerException';

class Requester {

  /**
   * @type {string}
   */
  #auth = null;

  /**
   * @type {string}
   */
  #basePath = '';

  /**
   * register authorisation header value that will be used
   * during request if useAuth is set to true.
   *
   * @param {string} auth authorization header value
   */
  registerAuth(auth) {
    this.#auth = auth;
  }

  /**
   * register basePath that will be used
   *
   * @param {string} basePath a request URI or a suffix path.
   */
  registerBasePath(basePath) {
    this.#basePath = basePath;
  }

  /**
   * send request to sever with GET method
   *
   * @async
   * @param {string} path a request URI or a suffix path.
   *                      - if given string begin by protocol http or https,
   *                        it is considered as complete URI (without query parameters)
   *                      - otherwise it is considered as suffix path and it
   *                        will be concatenate to host address or to base URI (defined in ComhonConfig).
   * @param {Object} headers the request headers. each object property is a header name,
   *                         each object value is the corresponding header value
   * @param {*} body the request body.
   * @param {Object} queryParams the request query parameters. each object property is a parameter name,
   *                         each object value is the corresponding parameter value
   * @param {boolean} useAuth if true the authorisation header is automatically added with
   *                          token value registered in Account and with token type registered in ComhonConfig.
   * @returns {Promise<XMLHttpRequest>} the response
   */
  async get(path, headers = null, body = null, queryParams = null, useAuth = true) {
    return this.request(path, 'GET', headers, body, queryParams, useAuth);
  }


  /**
   * send request to sever with POST method
   *
   * @async
   * @param {string} path a request URI or a suffix path.
   *                      - if given string begin by protocol http or https,
   *                        it is considered as complete URI (without query parameters)
   *                      - otherwise it is considered as suffix path and it
   *                        will be concatenate to host address or to base URI (defined in ComhonConfig).
   * @param {Object} headers the request headers. each object property is a header name,
   *                         each object value is the corresponding header value
   * @param {*} body the request body.
   * @param {Object} queryParams the request query parameters. each object property is a parameter name,
   *                         each object value is the corresponding parameter value
   * @param {boolean} useAuth if true the authorisation header is automatically added with
   *                          token value registered in Account and with token type registered in ComhonConfig.
   * @returns {Promise<XMLHttpRequest>} the response
   */
  async post(path, headers = null, body = null, queryParams = null, useAuth = true) {
    return this.request(path, 'POST', headers, body, queryParams, useAuth);
  }

  /**
   * send request to sever with GET method
   *
   * @async
   * @param {string} path a request URI or a suffix path.
   *                      - if given string begin by protocol http or https,
   *                        it is considered as complete URI (without query parameters)
   *                      - otherwise it is considered as suffix path and it
   *                        will be concatenate to host address or to base URI (defined in ComhonConfig).
   * @param {Object} headers the request headers. each object property is a header name,
   *                         each object value is the corresponding header value
   * @param {*} body the request body.
   * @param {Object} queryParams the request query parameters. each object property is a parameter name,
   *                         each object value is the corresponding parameter value
   * @param {boolean} useAuth if true the authorisation header is automatically added with
   *                          token value registered in Account and with token type registered in ComhonConfig.
   * @returns {Promise<XMLHttpRequest>} the response
   */
  async options(path, headers = null, body = null, queryParams = null, useAuth = true) {
    return this.request(path, 'OPTIONS', headers, body, queryParams, useAuth);
  }

  /**
   * send request to sever
   *
   * @async
   * @param {string} path a request URI or a suffix path.
   *                      - if given string begin by protocol http or https,
   *                        it is considered as complete URI (without query parameters)
   *                      - otherwise it is considered as suffix path and it
   *                        will be concatenate to host address or to base URI (defined in ComhonConfig).
   * @param {string} method the request method (GET, POST, ...).
   * @param {Object} headers the request headers. each object property is a header name,
   *                         each object value is the corresponding header value
   * @param {*} body the request body.
   * @param {Object} queryParams the request query parameters. each object property is a parameter name,
   *                         each object value is the corresponding parameter value
   * @param {boolean} useAuth if true the authorisation header is automatically added with
   *                          token value registered in Account and with token type registered in ComhonConfig.
   * @returns {Promise<XMLHttpRequest>} the response
   */
  async request(path, method, headers, body, queryParams, useAuth = true) {
    if (path.indexOf('http:') !== 0 && path.indexOf('https:') !== 0) {
      path = this.#basePath + path;
    }
    return await new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
          resolve(xhr);
      });
      xhr.addEventListener('error', (error) => {
        reject(new UnknownServerException());
      });
      const params = [];
      if (queryParams !== null) {
        if (typeof queryParams !== 'object') {
          throw new Error('invalid parameter 5 (queryParams). it must be an object');
        }
        for (const name in queryParams) {
          if (queryParams.hasOwnProperty(name)) {
              params.push(`${name}=${queryParams[name]}`);
          }
        }
      }
      const query = params.length === 0 ? '' : '?' + params.join('&');
      xhr.open(method, encodeURI(path + query));

      if (headers !== null) {
        if (typeof headers !== 'object') {
          throw new Error('invalid parameter 3 (headers). it must be an object');
        }
        for (const name in headers) {
          if (headers.hasOwnProperty(name)) {
              xhr.setRequestHeader(name, headers[name]);
          }
        }
      }
      if (useAuth && this.#auth !== null) {
        xhr.setRequestHeader('Authorization', this.#auth)
      }
      xhr.send(body);
    });
  }

}

export default Requester;
