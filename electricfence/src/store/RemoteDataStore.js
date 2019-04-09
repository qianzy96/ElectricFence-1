/*
  RemoteDataStore zhuyu 2018/11/9
 */

import {
  observable,
  action,
  computed,
} from 'mobx';

class DeviceDataStore {
  @observable deviceList = new Map();
  @observable deviceDirectoryList = [];

  @action changeDeviceDirectoryList = ({
    data
  }) => {
    this.deviceDirectoryList = data;
  };
};

class UserDataStore {
  @observable jwtToken = '';
  @observable apiUrl = '';
  @observable userData = new Map();

  @action changeJwtToken = ({
    data
  }) => {
    this.jwtToken = data;
  };
  @action changeApiUrl = ({
    data
  }) => {
    this.apiUrl = data;
  };
}

const deviceDataStore = new DeviceDataStore();
const userDataStore = new UserDataStore();

export {
  deviceDataStore,
  userDataStore
}
