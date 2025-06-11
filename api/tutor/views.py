# backend/api/tutor/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated # IsAuthenticated を使用しない、またはAllowAnyに変更
from django.contrib.auth import authenticate, login
from .serializers import LoginSerializer, LessonScheduleSerializer
from .models import LessonSchedule

# 既存のLoginView
class LoginView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user) 
                return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# LessonSchedule モデル用のビューセット
class LessonScheduleViewSet(viewsets.ModelViewSet):
    queryset = LessonSchedule.objects.all().order_by('start_time') 
    serializer_class = LessonScheduleSerializer
    # ★ここをコメントアウトするか、AllowAnyに変更します★
    # permission_classes = [IsAuthenticated] 
    permission_classes = [AllowAny] # 一時的に全てのアクセスを許可