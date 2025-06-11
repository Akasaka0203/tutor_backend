# backend/api/tutor/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser # ★この行を追加★

from django.contrib.auth import authenticate, login
# get_user_modelをここでインポートすることを確実にしてください
from django.contrib.auth import get_user_model 

from .serializers import (
    LoginSerializer,
    LessonScheduleSerializer,
    HomeworkSerializer,
    QuestionSerializer,
    StudentHomeworkSubmissionSerializer,
    TutorGradingSerializer,
    HomeworkDetailSerializer
)
from .models import (
    LessonSchedule,
    Homework,
    Question,
    StudentHomeworkSubmission,
    TutorGrading
)

# 既存のLoginView (変更なし)
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

# LessonSchedule モデル用のビューセット (変更なし)
class LessonScheduleViewSet(viewsets.ModelViewSet):
    queryset = LessonSchedule.objects.all().order_by('start_time') 
    serializer_class = LessonScheduleSerializer
    permission_classes = [AllowAny]

# --- 課題管理用ビューセット ---

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all().order_by('-created_at')
    # ★ここに追加★ FormDataとファイルのパースを可能にする
    parser_classes = [MultiPartParser, FormParser] 

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HomeworkDetailSerializer
        return HomeworkSerializer

    def get_queryset(self):
        # ログインユーザーが講師の場合、自分が作成した課題のみを表示
        # 現在AllowAnyでデバッグユーザー割り当てのため、このロジックはコメントアウト推奨
        # 認証が実装されたら有効化してください
        # if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'tutor':
        #     return self.queryset.filter(tutor=self.request.user)
        # return self.queryset.none()
        return Homework.objects.all().order_by('-created_at') # デバッグ中は全て表示

    def get_permissions(self):
        # 開発中はAllowAnyでOK
        return [AllowAny()]

    def perform_create(self, serializer):
        User = get_user_model()
        try:
            # データベースに最低1人のユーザーが存在することを確認してください
            debug_tutor_user = User.objects.first() 
        except User.DoesNotExist:
            print("WARNING: No user found in the database. Cannot assign a tutor for homework creation.")
            return Response({"detail": "No debug user available to assign as tutor. Please create a user."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if debug_tutor_user:
            serializer.save(tutor=debug_tutor_user)
        else:
            print("WARNING: debug_tutor_user is None after query. Unexpected.")
            return Response({"detail": "Failed to assign debug tutor during homework creation."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentHomeworkSubmissionViewSet(viewsets.ModelViewSet):
    queryset = StudentHomeworkSubmission.objects.all().order_by('-submitted_at')
    serializer_class = StudentHomeworkSubmissionSerializer
    # ★ここに追加★ FormDataとファイルのパースを可能にする (添付ファイルがある場合)
    parser_classes = [MultiPartParser, FormParser] 

    def get_queryset(self):
        # ここも認証が実装されたら、ログインユーザーの提出のみに絞るべき
        return StudentHomeworkSubmission.objects.all().order_by('-submitted_at')

    def get_permissions(self):
        return [AllowAny()]

    def perform_create(self, serializer):
        User = get_user_model()
        try:
            debug_student_user = User.objects.first()
        except User.DoesNotExist:
            print("WARNING: No user found for debug_student_user.")
            return Response({"detail": "No debug user available for submission. Please create a user."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if debug_student_user:
            serializer.save(student=debug_student_user)
        else:
            print("WARNING: debug_student_user is None after query. Unexpected.")
            return Response({"detail": "Failed to assign debug student during submission."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TutorGradingViewSet(viewsets.ModelViewSet):
    queryset = TutorGrading.objects.all().order_by('-graded_at')
    serializer_class = TutorGradingSerializer
    # ★ここにも追加 (採点にファイル添付がない場合でも、念のため)
    parser_classes = [MultiPartParser, FormParser] 

    def get_queryset(self):
        return TutorGrading.objects.all().order_by('-graded_at')

    def get_permissions(self):
        return [AllowAny()] 

    def perform_create(self, serializer):
        User = get_user_model()
        try:
            debug_tutor_user = User.objects.first()
        except User.DoesNotExist:
            print("WARNING: No user found for debug_tutor_user (grading).")
            return Response({"detail": "No debug user available for grading. Please create a user."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if debug_tutor_user:
            serializer.save(tutor=debug_tutor_user)
        else:
            print("WARNING: debug_tutor_user is None after query (grading). Unexpected.")
            return Response({"detail": "Failed to assign debug tutor during grading."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)