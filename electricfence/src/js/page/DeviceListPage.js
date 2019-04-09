/*
  DeviceListPage zhuyu 2018/11/7
 */
import React, {
  Component
} from 'react';
import {
  Table,
  Button,
} from 'antd';
import {
  inject,
  observer
} from 'mobx-react';
import {
  toJS
} from 'mobx';

import '../../css/DeviceListPage.css';

const PAGE_WORD = {
  online: '在线',
  offline: '离线',
  update: '升级',
  vpn: '远程连接',
  nameTitle: '名称',
  stateTitle: '状态',
  versionTitle: '版本',
  heartTitle: '心跳时间',
  actionTitle: '操作',
  reload: '刷新数据',
  oemModel: '型号',

  internetError: '网络错误',
}

@inject('userDataStore', 'deviceDataStore')
@observer
class DeviceListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortedInfo: null,
      filteredInfo: null,
      deviceList: [],
    };
    this.userDataStore = this.props.userDataStore;
    this.deviceDataStore = this.props.deviceDataStore;
  }

  handleChange = (pagination, filters, sorter) => {
    // console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  };

  strSort = ({
    key
  }, a, b, ) => {
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    }
    return 0;
  };

  actionButtonRender = (text, record, index) => {
    // console.log(record);
    return (
      <div>
        <Button style={{ 'marginRight':'5px', }} onClick={this.actionButtonEvent.bind(this,{data:record,type:'update'})} >{ PAGE_WORD.update }</Button>
        <Button style={{ 'marginLeft':'5px', }} onClick={this.actionButtonEvent.bind(this,{data:record,type:'vpn'})} >{ PAGE_WORD.vpn }</Button>
      </div>
    );
  };

  actionButtonEvent = async ({
    data,
    type
  }) => {
    let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
    if (type === 'update') {
      await fetch(`/api/Device/updateDeviceAction/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ jwtToken }`,
        },
        body: JSON.stringify({
          mac: data.mac,
        }),
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request Error');
        }
      }).then((data) => {
        alert(data.status);
      }).catch(() => {
        alert('updateFail');
      });
    } else if (type === 'vpn') {
      await fetch(`/api/Device/vpnDeviceAction/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ jwtToken }`,
        },
        body: JSON.stringify({
          mac: data.mac,
        }),
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request Error');
        }
      }).then((data) => {
        alert(`vpnPort:${data.vpnPort}`);
      }).catch(() => {
        alert('vpnFail');
      })
    }
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
      this.setState({
        deviceList: Object.values(toJS(this.deviceDataStore.deviceList))
      });
    }).catch((error) => {
      console.log(error);
      alert(PAGE_WORD.internetError);
    });
  };

  stateChangeText = (text, record, index) => {
    let now = Date.now();
    let res = '';
    if (now - Number(record.lastHeartTime) * 1000 > 300 * 1000) {
      res = PAGE_WORD.offline;
    } else {
      res = PAGE_WORD.online;
    }
    return res;
  };

  heartTimeChangeText = (text, record, index) => {
    if (text) {
      return new Date(Number(text) * 1000).toLocaleString('zh-CN', {
        hour12: false
      });
    } else {
      return text;
    }
  };

  statusFilter = (value, record) => {
    let now = Date.now();
    let res = now - 300 * 1000;
    let condition = {
      online: res <= Number(record.lastHeartTime) * 1000,
      offline: res > Number(record.lastHeartTime) * 1000,
    };
    return condition[value];
  };

  componentWillMount() {
    this.loadDeviceListData();
  }

  render() {
    let {
      sortedInfo,
      filteredInfo,
    } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [{
      key: 'name',
      dataIndex: 'name',
      title: PAGE_WORD.nameTitle,
      sorter: this.strSort.bind(this, {
        key: 'name',
      }),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    }, {
      key: 'mac',
      dataIndex: 'mac',
      title: 'MAC',
      sorter: this.strSort.bind(this, {
        key: 'mac',
      }),
      sortOrder: sortedInfo.columnKey === 'mac' && sortedInfo.order,
    }, {
      key: 'ip',
      dataIndex: 'ip',
      title: 'IP',
      sorter: this.strSort.bind(this, {
        key: 'ip'
      }),
      sortOrder: sortedInfo.columnKey === 'ip' && sortedInfo.order,
    }, {
      key: 'state',
      dataIndex: 'state',
      title: PAGE_WORD.stateTitle,
      sorter: this.strSort.bind(this, {
        key: 'lastHeartTime'
      }),
      sortOrder: sortedInfo.columnKey === 'state' && sortedInfo.order,
      render: this.stateChangeText,
      filters: [{
        text: PAGE_WORD.online,
        value: 'online'
      }, {
        text: PAGE_WORD.offline,
        value: 'offline',
      }],
      filteredValue: filteredInfo.state || null,
      onFilter: this.statusFilter,
      filtered: true,
      width: '8vw',
    }, {
      key: 'version',
      dataIndex: 'version',
      title: PAGE_WORD.versionTitle,
      sorter: this.strSort.bind(this, {
        key: 'version'
      }),
      sortOrder: sortedInfo.columnKey === 'version' && sortedInfo.order,
    }, {
      key: 'lastHeartTime',
      dataIndex: 'lastHeartTime',
      title: PAGE_WORD.heartTitle,
      render: this.heartTimeChangeText,
      sorter: this.strSort.bind(this, {
        key: 'lastHeartTime'
      }),
      sortOrder: sortedInfo.columnKey === 'lastHeartTime' && sortedInfo.order,
    }, {
      key: 'deviceID',
      dataIndex: 'deviceID',
      title: 'DeviceID',
      sorter: this.strSort.bind(this, {
        key: 'deviceID'
      }),
      sortOrder: sortedInfo.columnKey === 'deviceID' && sortedInfo.order,
    }, {
      key: 'action',
      // dataIndex: 'name',
      title: PAGE_WORD.actionTitle,
      render: this.actionButtonRender,
    }];
    return (
      <div>
        <div className="table-operations">
          <Button
            onClick = { this.loadDeviceListData }
            type = "primary"
            size = "large"
            >
            { PAGE_WORD.reload }
          </Button>
        </div>
        <Table columns={columns} dataSource={ this.state.deviceList } onChange={this.handleChange} />
      </div>
    );
  }
}

export default DeviceListPage;
