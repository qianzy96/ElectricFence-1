from django.db import models
import time

# Create your models here.

class Device(models.Model):
    """
    Description: Model Description
    """
    mac = models.CharField(max_length=32,unique=True)
    name = models.CharField(max_length=64,default='',blank=True)
    model = models.CharField(max_length=32,default='',blank=True)
    oemModel = models.CharField(max_length=32,default='',blank=True)
    sn = models.CharField(max_length=64,default='',blank=True)
    ip = models.CharField(max_length=64,default='',blank=True)
    privateIP = models.CharField(max_length=64,default='',blank=True)
    version = models.CharField(max_length=64,default='',blank=True)
    lastHeartTime = models.CharField(max_length=128,blank=True,default=int(time.time()))
    deviceID = models.CharField(max_length=128,blank=True,default='')
    # state = models.CharField(max_length=32,default='',blank=True)

    vpnState = models.CharField(max_length = 32,default = 'off',blank = True)
    vpnIP = models.CharField(max_length = 32,default = '',blank = True)
    updateState = models.CharField(max_length = 32,default = '',blank = True)
    updateVersion = models.CharField(max_length = 32,default = '',blank = True)
    rebootState = models.CharField(max_length = 32,default = '',blank = True)

    directoryID = models.CharField(max_length=32,default = '',blank = True)
    address = models.CharField(max_length=128, default = '',blank = True)


    class Meta:
        indexes = [
            models.Index(fields = ['mac']),
        ]

class DeviceDirectory(models.Model):
    """
    Description: Model Description
    """
    name = models.CharField(max_length = 128, default = '',unique = True)
    discription = models.CharField(max_length = 128, default = '',blank = True)
    parent = models.CharField(max_length=32, default = '',blank = True)

    class Meta:
        pass


class DeviceDetailSetting(models.Model):
    """
    Description: Model Description
    """
    device = models.OneToOneField(
        Device,
        on_delete = models.CASCADE,
        related_name = 'deviceDetailSetting',
    )
    uploadIp = models.CharField(max_length=32, default = '',blank = True)
    uploadPort = models.CharField(max_length=32, default = '',blank = True)
    uploadUsername = models.CharField(max_length=32, default = '',blank = True)
    uploadPassword = models.CharField(max_length=32, default = '',blank = True)

    class Meta:
        pass
