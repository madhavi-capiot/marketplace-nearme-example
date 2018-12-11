import { Selector } from 'testcafe';

export default class HomePage {
  constructor() {
    this.link = {
      register: Selector('a').withText('Register'),
      login: Selector('a').withText('Log in'),
    };
  }
}
