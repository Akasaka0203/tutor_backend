# backend/api/tutor/urls.py

from django.urls import path, include # 'include' を追加
from rest_framework.routers import DefaultRouter # DefaultRouter を追加
from .views import LoginView, LessonScheduleViewSet # LessonScheduleViewSet を追加

router = DefaultRouter()
router.register(r'events', LessonScheduleViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)), # この行を追加
]