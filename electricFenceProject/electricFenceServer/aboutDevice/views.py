#coding=utf-8
from django.shortcuts import render
from rest_framework import viewsets,status
from .serializers import DeviceSerializer,DeviceDirectorySerializer,DeviceDetailSettingSerializer
from .models import Device,DeviceDirectory,DeviceDetailSetting

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAdminUser
from rest_framework.reverse import reverse,reverse_lazy

import socket
import json
import time
import binascii
import urllib
import re

# Create your views here.
class DeviceViewSet(viewsets.ModelViewSet):
    """docstring for DeviceViewSet"""
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'updateDeviceAction' and self.action == 'vpnDeviceAction':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail = False,methods = ['post'],permission_classes = [IsAuthenticated])
    def updateDeviceAction(self,request):
        data = request.data
        if 'mac' in data and data['mac'] != '':
            if Device.objects.filter(mac = data['mac']).exists():
                device = Device.objects.get(mac = data['mac'])
                # TODO: update device
                res = self.updateAction(device)
                #
                return Response({'status':res,'mac':data['mac']})
        return Response({'status':'updateFail'},status = status.HTTP_400_BAD_REQUEST)

    @action(detail = False,methods = ['post'],permission_classes = [IsAuthenticated])
    def vpnDeviceAction(self,request):
        data = request.data
        if 'mac' in data and data['mac'] != '':
            if Device.objects.filter(mac = data['mac']).exists():
                device = Device.objects.get(mac = data['mac'])
                # TODO: vpn action
                self.vpnAction(device,{'port':str(10000 + int(device.pk))})
                #
                return Response({'status':'vpnSuccess','mac':data['mac'],'vpnPort':str(10000 + int(device.pk))})
        return Response({'status':'vpnFail'},status = status.HTTP_400_BAD_REQUEST)

    def vpnAction(self,instance,data):
        startssh = {
            "dmac":instance.mac,
            "cmd":"1",
            "ip":"115.28.241.216",
            "port":data['port'],
            "timestamp":str(int(time.time()))
        }
        print ('*************deviceVpnLog*****************')
        print (json.dumps(startssh))
        print ('*************deviceVpnLog*****************')
        deviceSettingDelivery(json.dumps(startssh))

    def updateAction(self,instance):
        url = 'http://115.28.241.216:81/version/spotcli/'
        website = urllib.request.urlopen(url)
        html = str(website.read(), encoding='utf-8').replace('\n','')
        links = re.findall(r'<a href="([\.\w]+)">[\.\w]+', html)
        links.sort(reverse = True)
        print (links)

        if len(links) != 0:
            ugurl = '{url}{file}'.format(url = url,file = links[0])

            upgrade = {
                "dmac":instance.mac,
                "cmd":"2",
                "ugurl":ugurl,
                "timestamp":str(int(time.time()))
            }

            print ('*************deviceUpdateLog*****************')
            print (json.dumps(upgrade))
            print ('*************deviceUpdateLog*****************')
            deviceSettingDelivery(json.dumps(upgrade))
            return 'updating'
        else:
            return 'notUpdateFile'



class DeviceDirectoryViewSet(viewsets.ModelViewSet):
    """docstring for DeviceViewSet"""
    queryset = DeviceDirectory.objects.all()
    serializer_class = DeviceDirectorySerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # if self.action == 'updateDeviceAction' and self.action == 'vpnDeviceAction':
        #     permission_classes = [IsAuthenticated]
        # else:
        #     permission_classes = [IsAuthenticated]
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if DeviceDirectory.objects.filter(parent = instance.pk).exists():
            childrenObj = DeviceDirectory.objects.filter(parent = instance.pk)
            for i in childrenObj:
                self.perform_destroy(i)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class DeviceDetailSettingViewSet(viewsets.ModelViewSet):
    """docstring for DeviceViewSet"""
    queryset = DeviceDetailSetting.objects.all()
    serializer_class = DeviceDetailSettingSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # if self.action == 'updateDeviceAction' and self.action == 'vpnDeviceAction':
        #     permission_classes = [IsAuthenticated]
        # else:
        #     permission_classes = [IsAuthenticated]
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


    @action(detail = False,methods = ['get'],permission_classes = [IsAuthenticated])
    def catchUrl(self,request):
        catchUrl = reverse_lazy('token_refresh', request=request)
        return Response({'url':catchUrl.replace('/api/token/refresh/','')})


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        #
        instance = DeviceDetailSetting.objects.get(pk = serializer.data['pk'])
        self.createDeviceSetting(instance)
        #
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        #
        self.createDeviceSetting(instance)
        #
        return Response(serializer.data)

    def createDeviceSetting(self,instance):
        deviceSetting = {
            "dmac":instance.device.mac,
            "cmd":"3",
            "crc":getcrc32('{"ip":"%s","port":"%s","name":"%s","password":"%s"}'%(instance.uploadIp,instance.uploadPort,instance.uploadUsername,instance.uploadPassword)),
            "ip":instance.uploadIp,
            "port":instance.uploadPort,
            "timestamp":str(int(time.time())),
            "name":instance.uploadUsername,
            "password":instance.uploadPassword
        }
        print ('*************deviceSettingsLog*****************')
        print (json.dumps(deviceSetting))
        print ('*************deviceSettingsLog*****************')
        deviceSettingDelivery(json.dumps(deviceSetting))




def deviceSettingDelivery(data):
    #创建客户端socket对象
    clientsocket = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    #服务端IP地址和端口号元组
    server_address = ('127.0.0.1',8082)
    #客户端连接指定的IP地址和端口号
    clientsocket.connect(server_address)

    clientsocket.sendall(data.encode())
    #客户端接收数据
    #server_data = clientsocket.recv(1024)
    # print '客户端收到的数据：', server_data
    #关闭客户端socket

    clientsocket.close()


def getcrc32(v):
    return '%x' % (binascii.crc32(v.encode()) & 0xffffffff)
