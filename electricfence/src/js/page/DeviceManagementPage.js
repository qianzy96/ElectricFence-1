/*
  DeviceManagementPage zhuyu 2018/11/22
 */

import React, {
  Component
} from 'react';
import {
  Tree,
  Button,
  Input,
  Select,
} from 'antd';
import {
  inject,
  observer
} from 'mobx-react';
import {
  toJS
} from 'mobx';

import '../../css/DeviceManagementPage.css';

const TreeNode = Tree.TreeNode;
const Option = Select.Option;

const PAGE_WORD = {
  deviceDirectory: '设备目录',
  device: '新增设备',
  save: '保存',
  saveSuccess: '保存成功',
  saveFailed: '保存失败',
  internetError: '网络错误',

  deviceNumber: '设备编号',
  deviceName: '设备名称',
  deviceAddress: '地址',
  deviceUploadIp: '上报IP',
  deviceUploadPort: '上报端口',
  deviceUploadUsername: '上报用户名',
  deviceUploadPassword: '上报密码',

  deviceNameInfo: '请输入设备名称',
  deviceDirectoryInfo: '请选择设备目录',
  deviceAddressInfo: '请输入设备地址',
  deviceUploadIpInfo: '请输入设备上报IP',
  deviceUploadPortInfo: '请输入设备上报端口',
  deviceUploadUsernameInfo: '请输入设备上报用户名',
  deviceUploadPasswordInfo: '请输入设备上报密码',
};

@inject('userDataStore', 'deviceDataStore')
@observer
class DeviceManagementPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deviceMac: '',
      devicePK: '',
      detailVisable: false,
      deviceDetailSettingUrl: null,
      deviceID: '',
      deviceName: '',
      deviceDirectory: '',
      deviceAddress: '',
      deviceUploadIp: '',
      deviceUploadPort: '',
      deviceUploadUsername: '',
      deviceUploadPassword: '',
    };
    this.userDataStore = this.props.userDataStore;
    this.deviceDataStore = this.props.deviceDataStore;
  };

  onSelect = (selectedKeys, info) => {
    let {
      selected,
      selectedNodes,
      node,
      event
    } = info;
    if (selectedKeys && selected && node.props.dataRef === 'device') {
      this.loadDeviceDetailData({
        mac: selectedKeys[0],
      });
    }
  };

  loadDirectoryListData = async () => {
    let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
    await fetch(`/api/DeviceDirectory/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ jwtToken }`,
      },
    }).then((response) => {
      // console.log(response);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request Error');
      }
    }).then((data) => {
      // console.log(data);
      data.forEach((value) => {
        if (value) {
          value.key = value.pk;
        }
      });
      this.deviceDataStore.changeDeviceDirectoryList({
        data
      });
    }).catch((error) => {
      console.log(error);
      alert(PAGE_WORD.internetError);
    });
  };

  loadDeviceListData = async () => {
    let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
    await fetch(`/api/Device/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ jwtToken }`,
      },
    }).then((response) => {
      // console.log(response);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request Error');
      }
    }).then((data) => {
      // console.log(data);
      data.forEach((value, index) => {
        if (value) {
          value.key = index;
          // console.log(value);
          // console.log(index);
          this.deviceDataStore.deviceList.set(value.mac, value);
        }
      });
    }).catch((error) => {
      console.log(error);
      alert(PAGE_WORD.internetError);
    });
  };

  treeNodeData = ({
    parent
  }) => {
    let data = this.deviceDataStore.deviceDirectoryList;
    return data.map((value) => {
      if (String(value.parent) === String(parent)) {
        if (data.find(val => String(val.parent) === String(value.pk))) {
          return (
            <TreeNode title={ value.name } key={value.pk} dataRef="directory" >
              { this.treeNodeData({parent:value.pk}) }
              { this.deviceTreeNodeData({directoryID:value.pk}) }
            </TreeNode>
          );
        } else {
          return (
            <TreeNode title={ value.name } key={value.pk} dataRef="directory" >
              { this.deviceTreeNodeData({directoryID:value.pk}) }
            </TreeNode>
          );
        }

      }
    });
  };

  deviceTreeNodeData = ({
    directoryID
  }) => {
    let data = Object.values(toJS(this.deviceDataStore.deviceList));
    return data.map((value) => {
      if (String(value.directoryID) === String(directoryID)) {
        return (<TreeNode title={ value.name || value.mac } key={value.mac} dataRef="device"/>);
      }
    });
  };

  inputChangeEvent = ({
    inputType
  }, e) => {
    this.setState({
      [inputType]: e.target.value,
    });
  };

  selectEvent = ({
    modalType
  }, value) => {
    this.setState({
      [modalType]: value,
    });
  };

  optionRender = () => {
    return this.deviceDataStore.deviceDirectoryList.map((value) => {
      let data = this.deviceDataStore.deviceDirectoryList.find((val) => {
        return Number(val.parent) === Number(value.pk);
      });
      if (!data) {
        return (<Option key = { value.pk }>{ value.name }</Option>)
      }
    });
  };

  loadDeviceDetailData = async ({
    mac
  }) => {
    let data = this.deviceDataStore.deviceList.get(mac);
    // console.log(data);
    if (!data.deviceDetailSetting) {
      this.setState({
        deviceUploadIp: '',
        deviceUploadPort: '',
        deviceUploadUsername: '',
        deviceUploadPassword: '',
      });
    } else {
      let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
      await fetch(data.deviceDetailSetting.replace(this.userDataStore.apiUrl, ''), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ jwtToken }`,
        },
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request Error');
        }
      }).then((value) => {
        console.log(value);
        this.setState({
          deviceUploadIp: value.uploadIp,
          deviceUploadPort: value.uploadPort,
          deviceUploadUsername: value.uploadUsername,
          deviceUploadPassword: value.uploadPassword,
        });
      }).catch((error) => {
        console.log(error);
        this.setState({
          deviceUploadIp: '',
          deviceUploadPort: '',
          deviceUploadUsername: '',
          deviceUploadPassword: '',
        });
        alert(PAGE_WORD.internetError);
      });
    }
    this.setState({
      deviceMac: data.mac,
      devicePK: data.pk,
      deviceDetailSettingUrl: data.deviceDetailSetting,
      deviceID: data.deviceID,
      deviceName: data.name,
      deviceDirectory: data.directoryID,
      deviceAddress: data.address,
      detailVisable: true,
    });
  };

  saveDeviceDetailData = async () => {
    let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
    let savedeviceBasicSetting = await fetch(`/api/Device/${ this.state.devicePK }/`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ jwtToken }`,
      },
      body: JSON.stringify({
        deviceID: this.state.deviceID,
        name: this.state.deviceName,
        directoryID: this.state.deviceDirectory,
        address: this.state.deviceAddress,
      }),
    }).then((response) => {
      // console.log(response);
      if (response.ok) {
        return Promise.resolve();
      } else {
        throw Promise.reject();
      }
    });
    let url = '';
    let body = {};
    let method = '';
    if (this.state.deviceDetailSettingUrl) {
      url = this.state.deviceDetailSettingUrl.replace(this.userDataStore.apiUrl, '');
      method = 'PATCH';
      body = {
        uploadIp: this.state.deviceUploadIp,
        uploadPort: this.state.deviceUploadPort,
        uploadUsername: this.state.deviceUploadUsername,
        uploadPassword: this.state.deviceUploadPassword,
      };
    } else {
      let apiUrl = this.userDataStore.apiUrl;
      url = `/api/DeviceDetailSetting/`;
      method = 'POST';
      body = {
        device: `${ apiUrl }/api/Device/${ this.state.devicePK }/`,
        uploadIp: this.state.deviceUploadIp,
        uploadPort: this.state.deviceUploadPort,
        uploadUsername: this.state.deviceUploadUsername,
        uploadPassword: this.state.deviceUploadPassword,
      }
    };
    let savedeviceDetailSetting = await fetch(url, {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ jwtToken }`,
      },
      body: JSON.stringify(body),
    }).then((response) => {
      // console.log(response);
      if (response.ok) {
        return Promise.resolve();
      } else {
        throw Promise.reject();
      }
    });

    Promise.all([savedeviceBasicSetting, savedeviceDetailSetting]).then(() => {
      alert(PAGE_WORD.saveSuccess);
    }).catch(() => {
      alert(PAGE_WORD.saveFailed);
    });

    this.loadDeviceListData();

  };

  componentWillMount() {
    if (this.deviceDataStore.deviceDirectoryList.length === 0) {
      this.loadDirectoryListData();
    }
    if (this.deviceDataStore.deviceList.size === 0) {
      this.loadDeviceListData();
    }
  }

  render() {
    return (
      <div className="deviceManagementDiv">
        <div className="directoryTreeDiv">
          <Tree
            onSelect={this.onSelect}
            defaultExpandedKeys = { ['deviceDirectory','device'] }
          >
            <TreeNode title={ PAGE_WORD.deviceDirectory } key="deviceDirectory" dataRef="directory">
              { this.treeNodeData({parent:''}) }
            </TreeNode>
            <TreeNode title={ PAGE_WORD.device } key="device" dataRef="directory">
              { this.deviceTreeNodeData({directoryID:''}) }
            </TreeNode>
          </Tree>
        </div>
        <div className="deviceDetailDiv" style={{'display':this.state.detailVisable ? 'flex':'none'}}>
          <div className="table-operations">
            <Button
              onClick = { this.saveDeviceDetailData }
              type = "primary"
              size = "large"
              >
              { PAGE_WORD.save }
            </Button>
          </div>
          <div className="deviceInfoDiv">
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceNumber }</span>
              </div>
              <div className="infoDetialDiv">
                <span className="spanToInputHeight"> { this.state.deviceID } </span>
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceName }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceNameInfo } value={this.state.deviceName} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceName'})} />
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceDirectory }</span>
              </div>
              <div className="infoDetialDiv">
                <Select defaultValue={this.state.deviceDirectory} style={{ width: '100%' }} onSelect={this.selectEvent.bind(this,{modalType:'deviceDirectory'})} value={this.state.deviceDirectory}>
                  <Option key="" value="">{ PAGE_WORD.deviceDirectoryInfo }</Option>
                  { this.optionRender() }
                </Select>
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceAddress }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceAddressInfo } value={this.state.deviceAddress} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceAddress'})} />
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceUploadIp }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceUploadIpInfo } value={this.state.deviceUploadIp} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceUploadIp'})} />
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceUploadPort }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceUploadPortInfo } value={this.state.deviceUploadPort} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceUploadPort'})} />
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceUploadUsername }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceUploadUsernameInfo } value={this.state.deviceUploadUsername} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceUploadUsername'})} />
              </div>
            </div>
            <div className="infoRowDiv">
              <div className="infoTitleDiv">
                <span className="spanToInputHeight">{ PAGE_WORD.deviceUploadPassword }</span>
              </div>
              <div className="infoDetialDiv">
                <Input type="text" placeholder={ PAGE_WORD.deviceUploadPasswordInfo } value={this.state.deviceUploadPassword} onChange={this.inputChangeEvent.bind(this,{inputType:'deviceUploadPassword'})} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default DeviceManagementPage;
