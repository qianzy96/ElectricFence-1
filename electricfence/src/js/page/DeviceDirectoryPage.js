/*
  DeviceDirectoryPage zhuyu 2018/11/7
 */
import React, {
  Component
} from 'react';
import {
  Table,
  Button,
  Modal,
  Select,
  Input,
} from 'antd';
import {
  inject,
  observer
} from 'mobx-react';
import {
  toJS
} from 'mobx';

import '../../css/DeviceDirectoryPage.css';

const PAGE_WORD = {
  directoryIDTitle: '编号',
  directoryNameTitle: '目录名称',
  directoryDiscriptionTitle: '目录描述',
  directoryParentTitle: '上级目录',
  actionTitle: '操作',
  addDirectory: '添加目录',
  deleteDirectory: '删除目录',
  editDirectory: '编辑目录',
  edit: '编辑',
  delete: '删除',
  directoryParentInfo: '请选择上级目录',
  directoryDiscriptionInfo: '请输入目录描述',
  directoryNameInfo: '请输入目录名称',
  cancel: '取消',
  submit: '提交',
  sure: '确定',
  deleteDirectoryInfo: '请注意此项操作会删除该目录以及该目录的所有子目录,此操作不可逆,请谨慎操作',

  inputEmptyError: '目录名称和目录描述不能为空',
  internetError: '网络错误',
  saveError: '保存失败,请检查目录名称是否重复',
  deleteError: '删除失败',
};

const Option = Select.Option;

@inject('userDataStore', 'deviceDataStore')
@observer
class DeviceDirectoryPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortedInfo: '',
      filteredInfo: '',

      addModalVisible: false,
      confirmLoading: false,

      directoryParent: '',
      directoryName: '',
      directoryDiscription: '',

      deleteModalVisable: false,
      deleteDirectoryPK: '',

      editModalVisible: false,
      editDirectoryPK: '',
      directoryParentEdit: '',
      directoryNameEdit: '',
      directoryDiscriptionEdit: '',
      confirmLoadingEdit: false,
    };
    this.userDataStore = this.props.userDataStore;
    this.deviceDataStore = this.props.deviceDataStore;
  }

  addDirectory = () => {
    this.setState({
      addModalVisible: true,
      directoryParent: '',
      directoryName: '',
      directoryDiscription: '',
    });
  };

  addDirectorySubmitEvent = async () => {
    let {
      directoryParent,
      directoryName,
      directoryDiscription
    } = this.state;
    if (directoryName.trim() === '' || directoryDiscription.trim() === '') {
      alert(PAGE_WORD.inputEmptyError);
    } else {
      let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
      this.setState({
        confirmLoading: true,
      });
      await fetch(`/api/DeviceDirectory/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ jwtToken }`,
        },
        body: JSON.stringify({
          name: directoryName,
          discription: directoryDiscription,
          parent: directoryParent,
        }),
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request Error');
        }
      }).then((data) => {
        setTimeout(() => {
          this.setState({
            addModalVisible: false,
            confirmLoading: false,
          });
        }, 1000);
        this.loadDirectoryListData();
      }).catch((error) => {
        console.log(error);
        setTimeout(() => {
          this.setState({
            confirmLoading: false,
          });
        }, 1000);
        alert(PAGE_WORD.saveError);
      });
    }
  };

  deleteDirectorySubmitEvent = async () => {
    console.log(this.state.deleteDirectoryPK);
    if (this.state.deleteDirectoryPK !== '') {
      let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
      await fetch(`/api/DeviceDirectory/${this.state.deleteDirectoryPK}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ jwtToken }`,
        },
      }).then((response) => {
        // console.log(response);
        if (response.ok) {
          this.setState({
            deleteModalVisable: false,
          });
          this.loadDirectoryListData();
        } else {
          throw new Error('Request Error');
        }
      }).catch((error) => {
        console.log(error);
        alert(PAGE_WORD.deleteError);
      });
    }
  };

  editDirectorySubmitEvent = async () => {
    let {
      directoryParentEdit,
      directoryNameEdit,
      directoryDiscriptionEdit,
      editDirectoryPK,
    } = this.state;
    if (editDirectoryPK !== '') {
      if (directoryNameEdit.trim() === '' || directoryDiscriptionEdit.trim() === '') {
        alert(PAGE_WORD.inputEmptyError);
      } else {
        let jwtToken = this.userDataStore.jwtToken !== '' ? this.userDataStore.jwtToken : localStorage.getItem('jwtToken');
        this.setState({
          confirmLoadingEdit: true,
        });
        await fetch(`/api/DeviceDirectory/${ editDirectoryPK }/`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ jwtToken }`,
          },
          body: JSON.stringify({
            name: directoryNameEdit,
            discription: directoryDiscriptionEdit,
            parent: directoryParentEdit,
          }),
        }).then((response) => {
          // console.log(response);
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Request Error');
          }
        }).then((data) => {
          setTimeout(() => {
            this.setState({
              editModalVisible: false,
              confirmLoadingEdit: false,
            });
          }, 1000);
          this.loadDirectoryListData();
        }).catch((error) => {
          console.log(error);
          setTimeout(() => {
            this.setState({
              confirmLoading: false,
            });
          }, 1000);
          alert(PAGE_WORD.saveError);
        });
      }
    }

  };

  handleCancel = ({
    modalType
  }) => {
    this.setState({
      [modalType]: false,
    });
  };

  optionRender = () => {
    // if (modalType === 'add') {
    //   return this.deviceDataStore.deviceDirectoryList.map((value) => {
    //     return (<Option key = { value.pk }>{ value.name }</Option>)
    //   });
    // } else if(modalType === 'edit'){
    //   let pk = this.state.directoryParentEdit;
    //   this.deviceDataStore.deviceDirectoryList.map((value)=>{
    //     if (value.pk !== pk) {
    //       if (value.parent !== pk) {
    //       }
    //     }
    //   });
    //   return this.deviceDataStore.deviceDirectoryList.map((value) => {
    //     if (value.pk !== pk) {
    //       return (<Option key = { value.pk }>{ value.name }</Option>)
    //     }
    //   });
    // }
    return this.deviceDataStore.deviceDirectoryList.map((value) => {
      return (<Option key = { value.pk }>{ value.name }</Option>)
    });
  };

  actionButtonRender = (text, record, index) => {
    // console.log(record.pk);
    return (
      <div>
        <Button style={{ 'marginRight':'5px', }} onClick = { this.editEvent.bind(this,{pk:record.pk}) } >{ PAGE_WORD.edit }</Button>
        <Button style={{ 'marginLeft':'5px', }} onClick = { this.deleteEvent.bind(this,{pk:record.pk}) } >{ PAGE_WORD.delete }</Button>
      </div>
    );
  };

  deleteEvent = ({
    pk
  }) => {
    this.setState({
      deleteDirectoryPK: pk,
      deleteModalVisable: true,
    });
  };

  editEvent = ({
    pk
  }) => {
    let data = this.deviceDataStore.deviceDirectoryList.find((value) => {
      return Number(value.pk) === Number(pk);
    });
    this.setState({
      editModalVisible: true,
      editDirectoryPK: pk,
      directoryParentEdit: data.parent || '',
      directoryNameEdit: data.name || '',
      directoryDiscriptionEdit: data.discription || '',
      confirmLoadingEdit: false,
    });
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

  handleChange = (pagination, filters, sorter) => {
    // console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  };

  selectEvent = ({
    modalType
  }, value) => {
    this.setState({
      [modalType]: value,
    });
  };

  inputChangeEvent = ({
    inputType
  }, e) => {
    this.setState({
      [inputType]: e.target.value,
    });
  };

  parentChangeText = (text, record, index) => {
    if (text) {
      let data = this.deviceDataStore.deviceDirectoryList.find((value) => {
        return Number(value.pk) === Number(text);
      });
      if (data) {
        return data.name
      } else {
        return text
      }
    } else {
      return text;
    }
  };

  componentWillMount() {
    this.loadDirectoryListData();
  }

  render() {
    const columns = [{
      key: 'pk',
      dataIndex: 'pk',
      title: PAGE_WORD.directoryIDTitle,
    }, {
      key: 'name',
      dataIndex: 'name',
      title: PAGE_WORD.directoryNameTitle,
    }, {
      key: 'discription',
      dataIndex: 'discription',
      title: PAGE_WORD.directoryDiscriptionTitle,
    }, {
      key: 'parent',
      dataIndex: 'parent',
      title: PAGE_WORD.directoryParentTitle,
      render: this.parentChangeText,
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
            onClick = { this.addDirectory }
            type = "primary"
            size = "large"
            >
            { PAGE_WORD.addDirectory }
          </Button>
        </div>
        <Table columns={columns} dataSource={ this.deviceDataStore.deviceDirectoryList } onChange={this.handleChange} />
        <Modal title={ PAGE_WORD.addDirectory }
          visible={this.state.addModalVisible}
          onOk={this.addDirectorySubmitEvent}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel.bind(this,{modalType:'addModalVisible'})}
          cancelText={PAGE_WORD.cancel}
          okText={PAGE_WORD.submit}
        >
          <div className="modal-mainDiv">
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryParentTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Select defaultValue="" style={{ width: '100%' }} onSelect={this.selectEvent.bind(this,{modalType:'directoryParent'})} value={this.state.directoryParent}>
                  <Option key="" value="">{ PAGE_WORD.directoryParentInfo }</Option>
                  { this.optionRender() }
                </Select>
              </div>
            </div>
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryNameTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Input type="text" placeholder={ PAGE_WORD.directoryNameInfo } value={this.state.directoryName} onChange={this.inputChangeEvent.bind(this,{inputType:'directoryName'})} />
              </div>
            </div>
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryDiscriptionTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Input placeholder={ PAGE_WORD.directoryDiscriptionInfo } value={this.state.directoryDiscription} onChange={this.inputChangeEvent.bind(this,{inputType:'directoryDiscription'})} />
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          title={ PAGE_WORD.deleteDirectory }
          visible={this.state.deleteModalVisable}
          onOk={this.deleteDirectorySubmitEvent}
          onCancel={this.handleCancel.bind(this,{modalType:'deleteModalVisable'})}
          cancelText={PAGE_WORD.cancel}
          okText={PAGE_WORD.sure}
        >
          <p>{ PAGE_WORD.deleteDirectoryInfo }</p>
        </Modal>

        <Modal title={ PAGE_WORD.editDirectory }
          visible={this.state.editModalVisible}
          onOk={this.editDirectorySubmitEvent}
          confirmLoading={this.state.confirmLoadingEdit}
          onCancel={this.handleCancel.bind(this,{modalType:'editModalVisible'})}
          cancelText={PAGE_WORD.cancel}
          okText={PAGE_WORD.submit}
        >
          <div className="modal-mainDiv">
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryParentTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Select defaultValue="" style={{ width: '100%' }} onSelect={this.selectEvent.bind(this,{modalType:'directoryParentEdit'})} value={this.state.directoryParentEdit}>
                  <Option key="" value="">{ PAGE_WORD.directoryParentInfo }</Option>
                  { this.optionRender() }
                </Select>
              </div>
            </div>
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryNameTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Input type="text" placeholder={ PAGE_WORD.directoryNameInfo } value={this.state.directoryNameEdit} onChange={this.inputChangeEvent.bind(this,{inputType:'directoryNameEdit'})} />
              </div>
            </div>
            <div className="modal-formRow">
              <div className="modal-textColumn">
                <p>{ PAGE_WORD.directoryDiscriptionTitle }</p>
              </div>
              <div className="modal-inputColumn">
                <Input placeholder={ PAGE_WORD.directoryDiscriptionInfo } value={this.state.directoryDiscriptionEdit} onChange={this.inputChangeEvent.bind(this,{inputType:'directoryDiscriptionEdit'})} />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

}


export default DeviceDirectoryPage;
