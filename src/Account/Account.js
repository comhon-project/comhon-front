import Cookie from '../Cookie/Cookie';
import Requester from 'Logic/Requester/Requester';

class Account {

  #token = null;
  #username = null;

  getToken() {
    return this.#token;
  }

  getUsername() {
    return this.#username;
  }

  importToken(token, register) {
    var splited = token.split(".");
    let payload = JSON.parse(atob(splited[1]));
    this.#username = payload.username;
    this.#token = token;
    Requester.registerAuth('Bearer '+this.#token);
    if (register) {
      Cookie.setCookie('token', token, 1);
    }
  }

  validateToken(token) {
    return Requester.get('', {Authorization: 'Bearer '+token});
  }

}

export default new Account();
