/*
  loginPage zhuyu 2018/11/6
*/

import React, {
  Component
} from 'react';
import {
  Input,
  Icon,
  Button,
} from 'antd';
import {
  inject,
  observer
} from 'mobx-react';


import '../../css/LoginPage.css';

const PAGE_WORD = {
  login: '登录',
  usernamePlaceholder: '请输入用户名',
  passwordPlaceholder: '请输入密码',

  infoEmpty: '账号或密码不能为空',
  infoError: '请输入正确的账号或密码',
};

@inject('userDataStore', 'localDataStore')
@observer
class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.userDataStore = this.props.userDataStore;
    this.localDataStore = this.props.localDataStore;
  }

  loginEvent = async () => {
    if (this.state.username.trim() === '' || this.state.password.trim() === '') {
      alert(PAGE_WORD.infoEmpty);
    } else {
      await fetch(`/api/token/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request Error');
        }
      }).then(async (data) => {
        // console.log(data);
        let jwtToken = data.access;
        this.userDataStore.changeJwtToken({
          data: jwtToken
        });
        localStorage.setItem('jwtToken', jwtToken);
        // console.log(localStorage.getItem('jwtToken'));
        this.props.history.push('/CommonMenu/DeviceListPage');
        // console.log(jwtToken);
      }).catch((error) => {
        console.log(error);
        alert(PAGE_WORD.infoError);
      });
    }
  };

  inputOnChangeEvent = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  render() {
    let iconStyle = {
      'color': '#1890ff',
      'fontSize': '1rem',
    };
    return (
      <div className = "BackgroundDiv" >
        <div className = "LoginDiv">
          <div className = "LoginDiv-headerDiv">
            <p> { PAGE_WORD.login } </p>
          </div>
          <div className = "LoginDiv-bodyDiv">
            <div className = "LoginDiv-body-componentDiv">
              <Input
                placeholder = { PAGE_WORD.usernamePlaceholder }
                prefix = { <Icon type = "user" style = { iconStyle }/> }
                size = "large"
                value = { this.state.username }
                name = "username"
                onChange = { this.inputOnChangeEvent }
              />
            </div>
            <div className = "LoginDiv-body-componentDiv">
              <Input
                placeholder = { PAGE_WORD.passwordPlaceholder }
                prefix = { <Icon type = "lock" style = { iconStyle }/> }
                size = "large"
                value = { this.state.password }
                name = "password"
                type = "password"
                onChange = { this.inputOnChangeEvent }
              />
            </div>
            <div className = "LoginDiv-body-componentDiv"/>
            <div className = "LoginDiv-body-componentDiv">
              <Button
                onClick = { this.loginEvent }
                type = "primary"
                size = "large"
                block>
                { PAGE_WORD.login }
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage
