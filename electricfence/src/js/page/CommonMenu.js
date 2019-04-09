/*
  CommonMenu zhuyu 2018/11/7
 */

import React, {
  Component
} from 'react';
import {
  Layout,
  Menu,
  Icon,
  Dropdown,
} from 'antd';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
} from "react-router-dom";
import {
  inject,
  observer
} from 'mobx-react';

import '../../css/CommonMenu.css';

import DeviceListPage from './DeviceListPage';
import DeviceDirectoryPage from './DeviceDirectoryPage';
import DeviceManagementPage from './DeviceManagementPage';

const {
  SubMenu
} = Menu;
const {
  Header,
  Content,
  Sider
} = Layout;

const PAGE_WORD = {
  webTitle: '电子围栏管理系统',
  control: '控制台',
  deviceList: '设备列表',
  deviceAction: '设备管理',
  sweepAction: '扫频管理',
  deviceDirectory: '设备目录',
  logout: '退出',
  internetError: '网络错误',
};

@inject('userDataStore', )
@observer
class CommonMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultSelectedKeys: '',
    };
    this.userDataStore = this.props.userDataStore;
  }

  logoutEvent = () => {
    this.userDataStore.changeJwtToken({
      data: ''
    });
    localStorage.removeItem('jwtToken');
    this.props.history.push('/');
  };

  getUserInfo = async () => {
    let jwtToken = '';
    if (this.userDataStore.jwtToken !== '' || localStorage.getItem('jwtToken') !== '') {
      jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');

      await fetch(`/api/User/ownDetailInfo/`, {
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
      }).then((userInfo) => {
        // console.log(userInfo);
        this.userDataStore.userData.set('username', userInfo.username);
        // console.log(this.userDataStore.userData.get('username'));
      }).catch((error) => {
        console.log(error);
        alert(PAGE_WORD.internetError);
      });

      await fetch(`/api/DeviceDetailSetting/catchUrl/`, {
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
        this.userDataStore.changeApiUrl({
          data: value.url
        });
      }).catch(() => {
        alert(PAGE_WORD.internetError);
      });
    } else {
      this.logoutEvent();
    };
  };


  componentWillMount() {
    this.getUserInfo();
    this.setState({
      defaultSelectedKeys: this.props.location.pathname,
    });
  }

  render() {
    return (
      <Router>
        <div className = "container">
          <Layout>
            <Header className = "header">
              <div className = "logo" >
                <p className = "webTitle">{ PAGE_WORD.webTitle }</p>
              </div>
              <div className = "dropdownComponent">
                <DropdownComponent event = { { logoutEvent:this.logoutEvent } }/>
              </div>
              <Menu
                theme="dark"
                mode="horizontal"
                style={{ lineHeight: '64px' }}
              >
              </Menu>
            </Header>
            <Layout>
              <Sider width={200} style={{ background: '#fff' }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={[this.state.defaultSelectedKeys]}
                  defaultOpenKeys={['control']}
                  style={{ height: '100%', borderRight: 0 }}
                >
                  <SubMenu key="control" title={<span><Icon type="user" />{ PAGE_WORD.control }</span>}>
                    <Menu.Item key="/CommonMenu/DeviceListPage"><Link to = "/CommonMenu/DeviceListPage" replace>{ PAGE_WORD.deviceList }</Link></Menu.Item>
                    <Menu.Item key="/CommonMenu/DeviceManagementPage"><Link to = "/CommonMenu/DeviceManagementPage" replace>{ PAGE_WORD.deviceAction }</Link></Menu.Item>
                    <Menu.Item key="sweepAction">{ PAGE_WORD.sweepAction }</Menu.Item>
                    <Menu.Item key="/CommonMenu/DeviceDirectoryPage"><Link to = "/CommonMenu/DeviceDirectoryPage" replace>{ PAGE_WORD.deviceDirectory }</Link></Menu.Item>
                  </SubMenu>
                </Menu>
              </Sider>
              <Layout style={{ padding: '24px' }}>
                <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
                  <div>
                    <Switch>
                      <Route
                        path = "/CommonMenu/DeviceListPage"
                        component = { DeviceListPage }
                      />
                      <Route
                        path = "/CommonMenu/DeviceManagementPage"
                        component = { DeviceManagementPage }
                      />
                      <Route
                        path = "/CommonMenu/DeviceDirectoryPage"
                        component = { DeviceDirectoryPage }
                      />
                    </Switch>
                  </div>
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </div>
      </Router>
    );
  }
}

@inject('userDataStore', )
@observer
class DropdownComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.event = this.props.event;
    this.userDataStore = this.props.userDataStore;
  }

  render() {
    let userData = this.userDataStore.userData;
    let menu = (
      <Menu>
        <Menu.Item>
          <a onClick = { this.event.logoutEvent }>{ PAGE_WORD.logout }</a>
        </Menu.Item>
      </Menu>);
    return (
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" href="#" >
          { userData.get('username') } <Icon type="down" />
        </a>
      </Dropdown>
    );
  }
}


export default CommonMenu;
