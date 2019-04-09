#!/usr/bin/env python
#-*- coding:utf-8 -*-

import socket
import select
import queue
import json
import redis
import time
import pymysql
import binascii

pool = redis.ConnectionPool(host='127.0.0.1', port=6379, decode_responses=True)
#spot server redis fd
ssrfd = redis.Redis(connection_pool=pool)

def getcrc32(v):
    return '%x' % (binascii.crc32(v) & 0xffffffff)

def accessedDevice2Mysql(data):
    try:
        # db = pymysql.connect("localhost", "root", "witrusty", "electricFenceServerDB" )
        db = pymysql.connect("192.168.1.234", "root", "sunshine", "electricFenceServerDB" )
        print ('xxxxqxxxxxxxxq')
    except Exception as e:
        try:
            sqlError =  "Error %d:%s" % (e.args[0], e.args[1])
            print (sqlError)
        except IndexError:
            print("MySQL Error:%s" % str(e))
        return False

    cursor = db.cursor()

    # data = {
    #     'mac':'111122223333',
    #     'name':'',
    #     'model':'wit',
    #     'oemModel':'wis',
    #     'sn':'12332112321',
    #     'ip':'192.168.1.1',
    #     'privateIP':'192.168.1.1',
    #     'version':'12321',
    #     'deviceID':'bj_changping_smkxy.110111.255',
    #     'lastHeartTime':'123321',#时间戳
    #     'vpnState':'',
    #     'vpnIP':'',
    #     'updateState':'',
    #     'updateVersion':'',
    #     'rebootState':'',
    # }

    # sql = "INSERT INTO aboutDevice_device(`mac`,`name`,`model`,`oemModel`,`sn`,`ip`,`privateIP`,`version`,`lastHeartTime`,`deviceID`,`vpnState`,`vpnIP`,`updateState`,`updateVersion`,`rebootState`) VALUES ('{mac}','','{model}','{oemModel}','{sn}','{ip}','{privateIP}','{version}','{lastHeartTime}','{deviceID}','','','','','') on duplicate key update model = values(model),oemModel = values(oemModel),sn = values(sn),ip = values(ip),privateIP = values(privateIP),version = values(version),deviceID = values(deviceID),lastHeartTime = values(lastHeartTime)".format(**data)

    # sql = "INSERT INTO aboutDevice_device(mac,name,model,oemModel,sn,ip,privateIP,version,lastHeartTime,vpnState,vpnIP,updateState,updateVersion,rebootState) VALUES ({mac},{name},{model},{oemModel},{sn},{ip},{privateIP},{version},{lastHeartTime},{vpnState},{vpnIP},{updateState},{updateVersion},{rebootState})".format(**data)
    print ('xxxxqxxxxxxxxqxwwww')
    sql = "SELECT count(*) as exist from aboutDevice_device where mac = '{mac}' limit 1".format(**data)
    print ('tttttttttttttttttttt')
    print (sql)
    try:
        cursor.execute(sql)
        rawQuery = cursor.fetchone()
        num = rawQuery[0]
        print (rawQuery)
        print (num)
        print ('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
    except Exception as e:
        print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
        print(sql)
        print(e)
        print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
        num = 0

    if num == 0 :
      sql = "INSERT INTO aboutDevice_device(`mac`,`name`,`model`,`oemModel`,`sn`,`ip`,`privateIP`,`version`,`lastHeartTime`,`deviceID`,`vpnState`,`vpnIP`,`updateState`,`updateVersion`,`rebootState`) VALUES ('{mac}','','{model}','{oemModel}','{sn}','{ip}','{privateIP}','{version}','{lastHeartTime}','{deviceID}','','','','','')".format(**data)
      print ('sqlsqlsqlsqlsqlsqlsqlsqlsql1')
    else :
      sql = "UPDATE aboutDevice_device set model = '{model}',oemModel = '{oemModel}',sn = '{sn}',ip = '{ip}',privateIP = '{privateIP}',version = '{version}',deviceID = '{deviceID}',lastHeartTime = '{lastHeartTime}' where mac = '{mac}'".format(**data)
      print ('sqlsqlsqlsqlsqlsqlsqlsqlsql2')

    try:
        cursor.execute(sql)
    except Exception as e:
        print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
        print(sql)
        print(e)
        print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    try:
        cursor.close()
        db.commit()
    except Exception as e:
        print(e)
        cursor.close()
        db.rollback()

    db.close()

class EpollServer(object):
    def __init__(self, host='127.0.0.1', port=8082):
        #创建socket对象
        self.serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        #设置IP地址复用
        self.serversocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        #ip地址和端口号
        self.server_address = (host, port)
        #绑定IP地址
        self.serversocket.bind(self.server_address)
        #监听，并设置最大连接数
        self.serversocket.listen(1024)
        print("服务器启动成功，监听IP：" , self.server_address)
        #服务端设置非阻塞
        self.serversocket.setblocking(False)
        #创建epoll事件对象，后续要监控的事件添加到其中
        self.epoll = select.epoll()
        #注册服务器监听fd到等待读事件集合
        self.epoll.register(self.serversocket.fileno(), select.EPOLLIN)
        # self.epoll.register(self.serversocket.fileno(), select.EPOLLET|select.EPOLLIN)
        self.errret = '{"status":9}'
        self.dfd = 0

    def is_json(self, jsonstr):
        print("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
        print(jsonstr)
        print("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
        try:
            json.loads(jsonstr)
        except ValueError:
            return False
        return True

    def get_device_ftp_report_config(self, dmac):
        cfg = ssrfd.hget("ftpreportcfg", dmac)
        if cfg:
            return cfg
        else:
            return None

    def process_keep_alive_message(self, jsdata):
        devMac = jsdata["mac"]
        ssrfd.hset("devinfo", devMac, json.dumps(jsdata))
        # print("ccccccccccccccccccccccc100000000000000000000")
        try:
            cfg = self.get_device_ftp_report_config(devMac)
            print("ccccccccccccccccccccccc111111111111111", cfg, jsdata["cfgcrc"])
            if cfg:
                cfgjs = json.loads(cfg)
                print("ccccccccccccccccccccccccccccc222222233333", type(jsdata["cfgcrc"]), type(cfgjs["crc"]))
                print("ccccccccccccccccccccccccccccc22222222222", cfgjs, cfgjs["crc"])
                if jsdata["cfgcrc"] == cfgjs["crc"]:
                    return None
                else:
                    #print("cccccccccccccccccccccccccccccccccc")
                    return '{"dmac":"%s","cmd":"3","timestamp":"%d","ip":"%s","port":"%s","name":"%s","password":"%s"}' % (devMac, int(time.time()), cfgjs["ip"], cfgjs["port"], cfgjs["name"], cfgjs["password"])
            else:
                return None
        except ValueError:
            return None

    def process_command_message(self, jsdata):
        #print "33333333333333333333333333333333333333"
        devMac = jsdata["dmac"]
        devinfo = ssrfd.hget("devinfo", devMac)
        if devinfo:
            devjs = json.loads(devinfo)
            self.dfd = devjs["fd"]
            #print "ffffffffffffffff", devjs["fd"]
        # set ftp server config
        #print "33333333333333333333333333333333333333"
        if jsdata["cmd"] == "3":
           ssrfd.hset("ftpreportcfg", devMac, json.dumps(jsdata))

    def handle_data(self, data, ip, port, fd):
        #print "11111111111111111111111111111111111"
        self.dfd = fd
        #print "2222222222222222222222222222222222", data
        data = data.decode('utf-8')
        print ('tt1t1t1t1t1t1')
        if self.is_json(data) == True:
            print ("wwwwwwwwwwwwwwww")
            js = json.loads(data)
            if "mac" in js.keys():
                js["ip"] = ip
                js["port"] = port
                js["fd"] = fd
                retmsg = self.process_keep_alive_message(js)
                devdata = {
                    'mac':'',
                    'name':'',
                    'model':'',
                    'oemModel':'',
                    'sn':'',
                    'ip':'',
                    'privateIP':'',
                    'version':'',
                    'deviceID':'',
                    'lastHeartTime':'',#时间戳
                    'vpnState':'',
                    'vpnIP':'',
                    'updateState':'',
                    'updateVersion':'',
                    'rebootState':'',
                }
                devdata["mac"] = js["mac"]
                devdata["ip"] = js["ip"]
                devdata["version"] = js["swversion"]
                devdata["deviceID"] = js["deviceID"]
                devdata["lastHeartTime"] = str(int(time.time()))
                print ('t2t2t2t2t2t2t')
                accessedDevice2Mysql(devdata)
                if retmsg:
                    return retmsg
                else:
                    return '{"status":0,"timestamp":%d}' % int(time.time())
            elif "cmd" in js.keys():
                self.process_command_message(js)
                return data
            else:
                return self.errret
        else:
            #print "qqqqqqqqqqqqqqqqqqqqq"
            return self.errret

    def run(self):
        #超时时间
        timeout = 10
        #保存连接客户端消息的字典，格式为{}
        message_queues = {}
        #文件句柄到所对应对象的字典，格式为{句柄：对象}
        fd_to_socket = {self.serversocket.fileno():self.serversocket,}

        while True:
            try:
                #print "等待活动连接......"
                #轮询注册的事件集合，返回值为[(文件句柄，对应的事件)，(...),....]
                events = self.epoll.poll(timeout)
                if not events:
                    print("epoll超时无活动连接，重新轮询......")
                    continue
                #print "有" , len(events), "个新事件，开始处理......"

                for fd, event in events:
                    socket = fd_to_socket[fd]
                    #如果活动socket为当前服务器socket，表示有新连接
                    if socket == self.serversocket:
                        connection, address = self.serversocket.accept()
                        print("新连接：" , address)
                        #新连接socket设置为非阻塞
                        connection.setblocking(False)
                        #注册新连接fd到待读事件集合
                        self.epoll.register(connection.fileno(), select.EPOLLIN)
                        #把新连接的文件句柄以及对象保存到字典
                        fd_to_socket[connection.fileno()] = connection
                        #以新连接的对象为键值，值存储在队列中，保存每个连接的信息
                        message_queues[connection]  = queue.Queue()
                    #关闭事件
                    elif event & select.EPOLLHUP:
                        print("客户端22：" , socket.getpeername(), "CLOSE CONNECT")
                        #在epoll中注销客户端的文件句柄
                        self.epoll.unregister(fd)
                        #关闭客户端的文件句柄
                        fd_to_socket[fd].close()
                        #在字典中删除与已关闭客户端相关的信息
                        del fd_to_socket[fd]
                        time.sleep(10)
                    #可读事件
                    elif event & select.EPOLLIN:
                        #print "11111111111"
                        #接收数据
                        data = socket.recv(1024)
                        if data:
                            print("长度：", len(data), "FD:", fd, "收到数据：" , data , "客户端33：" , socket.getpeername()[0], socket.getpeername()[1])
                            #处理收到的数据
                            #将数据后的返回值放入对应客户端的字典
                            msg = self.handle_data(data, socket.getpeername()[0], socket.getpeername()[1], fd)
                            local_socket = fd_to_socket[self.dfd]
                            if local_socket:
                                message_queues[local_socket].put(msg,)

                            #修改读取到消息的连接到等待写事件集合(即对应客户端收到消息后，再将其fd修改并加入写事件集合)
                            #self.epoll.modify(fd, select.EPOLLOUT)
                            # print "发送数据FD：" , self.dfd
                            self.epoll.modify(self.dfd, select.EPOLLOUT)
                        else:
                            print("NO DATA CLOSE CLIENT CONNECTION !!!")
                            self.epoll.unregister(fd)
                            fd_to_socket[fd].close()
                            del fd_to_socket[fd]
                    #可写事件
                    elif event & select.EPOLLOUT:
                        # print "EPOLLOUTEPOLLOUTEPOLLOUTEPOLLOUT"
                        try:
                            #从字典中获取对应客户端的信息
                            msg = message_queues[socket].get_nowait()
                        except queue.Empty:
                            print(socket.getpeername() , " queue empty")
                            #修改文件句柄为读事件
                            self.epoll.modify(fd, select.EPOLLIN)
                        else:
                            print("发送数据：" , msg , "客户端66 ：" , socket.getpeername(), "fd: ", fd)
                            #发送数据
                            socket.send(msg.encode('utf-8'))

            except Exception as e:
                print(e)
                self.epoll.unregister(fd)
                fd_to_socket[fd].close()
                del fd_to_socket[fd]
                # #在epoll中注销服务端文件句柄
                # self.epoll.unregister(self.serversocket.fileno())
                # #关闭epoll
                # self.epoll.close()
                # #关闭服务器socket
                # self.serversocket.close()

if __name__ == '__main__':
    server = EpollServer('0.0.0.0', 8088)
    server.run()
