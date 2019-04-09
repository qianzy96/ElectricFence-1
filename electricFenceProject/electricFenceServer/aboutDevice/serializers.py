#coding=utf-8
from rest_framework import serializers
from .models import Device,DeviceDirectory,DeviceDetailSetting



class DeviceSerializer(serializers.HyperlinkedModelSerializer):
    deviceDetailSetting = serializers.HyperlinkedRelatedField(view_name = 'deviceDetailSetting-detail',read_only = True)
    class Meta:
        model = Device
        fields = ('pk','mac','name','model','oemModel','sn','ip','privateIP','version','lastHeartTime','deviceID','vpnState','vpnIP','updateState','updateVersion','rebootState','directoryID','address','deviceDetailSetting')

class DeviceDirectorySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = DeviceDirectory
        fields = ('pk','name','discription','parent',)

class DeviceDetailSettingSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
      model = DeviceDetailSetting
      fields = ('pk','device','uploadIp','uploadPort','uploadUsername','uploadPassword')

