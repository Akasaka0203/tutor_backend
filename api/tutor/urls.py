# backend/api/tutor/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, LessonScheduleViewSet, HomeworkViewSet, StudentHomeworkSubmissionViewSet # LoginViewもインポート
# from django.conf import settings # メディアファイルサービング用 (開発用なので不要なら削除)
# from django.conf.urls.static import static # メディアファイルサービング用 (開発用なので不要なら削除)

router = DefaultRouter()
# LessonScheduleViewSet のエンドポイント名を 'lesson-schedules' に変更することを強く推奨します
# フロントエンドがこのエンドポイントと連携できるようにするためです。
router.register(r'lesson-schedules', LessonScheduleViewSet) # 'events' -> 'lesson-schedules' に変更
router.register(r'homeworks', HomeworkViewSet)
router.register(r'submissions', StudentHomeworkSubmissionViewSet)
# router.register(r'gradings', TutorGradingViewSet) # 必要に応じて追加済みであればそのまま

urlpatterns = [
    # LoginView は APIView なので、router.register ではなく path で直接登録します
    path('login/', LoginView.as_view(), name='login'), # 追加済みであればそのまま
    
    # router で登録されたビューセットのURLを含めます
    path('', include(router.urls)), # この行は正しい
    
    # ★★★ ここを完全に削除してください！これが無限ループの原因です！ ★★★
    # path('admin/', admin.site.urls),
    # path('api/tutor/', include('api.tutor.urls')), 
]

# 開発環境でメディアファイルをサーブするための設定 (必要であれば残す)
# if settings.DEBUG:
#    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)