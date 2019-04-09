/*
  LocalDataStore zhuyu 2018/11/9
 */

import {
  observable,
  action,
  computed,
} from 'mobx';

class LocalDataStore {
  @observable url = 'http://192.168.1.234:9000';
}

const localDataStore = new LocalDataStore();

export {
  localDataStore
}
