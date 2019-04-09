#coding=utf-8
from django.shortcuts import render
from rest_framework import viewsets,status
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import action,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAdminUser

import time,string
from django.db.models import Q

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    """docstring for DeviceViewSet"""
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'getOwnDetailInfo':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail = False,methods = ['get'],permission_classes = [IsAuthenticated])
    def ownDetailInfo(self,request):
        serializer = self.get_serializer(instance = request.user)
        return Response(serializer.data)
