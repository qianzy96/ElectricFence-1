#coding=utf-8
from .views import DeviceViewSet,DeviceDirectoryViewSet,DeviceDetailSettingViewSet
from rest_framework.routers import DefaultRouter

deviceRouter = DefaultRouter()
deviceRouter.register(r'api/Device',DeviceViewSet,base_name = 'device')
deviceRouter.register(r'api/DeviceDirectory',DeviceDirectoryViewSet,base_name = 'deviceDirectory')
deviceRouter.register(r'api/DeviceDetailSetting',DeviceDetailSettingViewSet,base_name = 'deviceDetailSetting')

