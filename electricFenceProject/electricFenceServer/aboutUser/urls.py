#coding=utf-8
from .views import UserViewSet
from rest_framework.routers import DefaultRouter

userRouter = DefaultRouter()
userRouter.register(r'api/User',UserViewSet,base_name = 'user')
