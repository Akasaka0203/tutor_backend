# backend/api/tutor/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser # 必要に応じて追加
from django.contrib.auth import authenticate, login
from .serializers import (
    LoginSerializer,
    LessonScheduleSerializer,
    HomeworkSerializer,
    QuestionSerializer, # QuestionSerializerも必要
    StudentHomeworkSubmissionSerializer,
    TutorGradingSerializer,
    HomeworkDetailSerializer # 詳細表示用
)
from .models import (
    LessonSchedule,
    Homework,
    Question,
    StudentHomeworkSubmission,
    TutorGrading
)

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

# --- 課題管理用ビューセット ---

class HomeworkViewSet(viewsets.ModelViewSet):
    # 講師は自身が作成した課題のみ、生徒は自身に割り当てられた課題のみを参照できるようにする
    queryset = Homework.objects.all().order_by('-created_at') 
    
    def get_serializer_class(self):
        if self.action == 'retrieve': # 詳細表示の場合
            return HomeworkDetailSerializer
        return HomeworkSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # TODO: 実際のロールに応じてフィルタリングを調整
            # 現時点では、全ての課題を表示 (開発用)
            # 例: 講師であれば自身が作成した課題のみ
            # if hasattr(user, 'is_tutor') and user.is_tutor:
            #     return Homework.objects.filter(tutor=user).order_by('-created_at')
            # # 例: 生徒であれば自身に割り当てられた課題のみ
            # elif hasattr(user, 'is_student') and user.is_student:
            #     # 生徒に課題を割り当てるロジックがないため、ここでは全ての課題を表示
            #     return Homework.objects.all().order_by('-created_at')
            return Homework.objects.all().order_by('-created_at')
        return Homework.objects.none() # 認証されていない場合は何も返さない

    # 課題の作成、更新、削除は認証された講師のみが行えるようにする
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # TODO: 認証済みで講師ロールを持つユーザーのみに許可
            # 例: [IsAuthenticated, IsTutorPermission]
            return [IsAuthenticated()] 
        return [AllowAny()] # リストと詳細の閲覧は一旦AllowAny

    def perform_create(self, serializer):
        # 講師情報をリクエストユーザーから自動的に設定
        # TODO: request.userが講師であることを検証する
        serializer.save(tutor=self.request.user)

class StudentHomeworkSubmissionViewSet(viewsets.ModelViewSet):
    queryset = StudentHomeworkSubmission.objects.all().order_by('-submitted_at')
    serializer_class = StudentHomeworkSubmissionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # 生徒であれば自身の提出のみ表示
            # TODO: ロールによるフィルタリングを追加 (is_studentなど)
            return StudentHomeworkSubmission.objects.filter(student=user).order_by('-submitted_at')
        # 講師であれば全ての提出、または特定の生徒の提出を表示できるようにする
        # 現時点では講師が全ての提出を見れるように設定
        # if hasattr(user, 'is_tutor') and user.is_tutor:
        #     return StudentHomeworkSubmission.objects.all().order_by('-submitted_at')
        return StudentHomeworkSubmission.objects.all().order_by('-submitted_at')
        
        return StudentHomeworkSubmission.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # TODO: 提出は認証済み生徒のみが作成、更新、削除可能
            return [IsAuthenticated()] 
        return [AllowAny()] # 閲覧はAllowAny

    def perform_create(self, serializer):
        # 生徒情報をリクエストユーザーから自動的に設定
        # TODO: request.userが生徒であることを検証する
        serializer.save(student=self.request.user)

class TutorGradingViewSet(viewsets.ModelViewSet):
    queryset = TutorGrading.objects.all().order_by('-graded_at')
    serializer_class = TutorGradingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # 講師であれば自身の採点、生徒であれば自身の提出に対する採点のみ表示
            # TODO: ロールによるフィルタリングを追加 (is_tutor, is_studentなど)
            # 現時点では全ての採点データを表示（開発用）
            # if hasattr(user, 'is_tutor') and user.is_tutor:
            #     return TutorGrading.objects.filter(tutor=user).order_by('-graded_at')
            # elif hasattr(user, 'is_student') and user.is_student:
            #     # 生徒は自身が提出した課題の採点のみ見れるようにする
            #     return TutorGrading.objects.filter(submission__student=user).order_by('-graded_at')
            return TutorGrading.objects.all().order_by('-graded_at')
        return TutorGrading.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # TODO: 採点は認証済み講師のみが作成、更新、削除可能
            return [IsAuthenticated()] 
        return [AllowAny()] # 閲覧はAllowAny

    def perform_create(self, serializer):
        # 講師情報をリクエストユーザーから自動的に設定
        # TODO: request.userが講師であることを検証する
        serializer.save(tutor=self.request.user)