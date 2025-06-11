# backend/api/tutor/admin.py

from django.contrib import admin
from .models import Homework, LessonSchedule, StudentHomeworkSubmission, TutorGrading, Question, StudentAnswer # QuestionとStudentAnswerもインポート

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'due_date', 'status', 'tutor', 'created_at')
    list_filter = ('status', 'due_date', 'tutor')
    search_fields = ('title', 'description')

@admin.register(LessonSchedule)
class LessonScheduleAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_time', 'end_time', 'color')
    list_filter = ('start_time', 'end_time')
    search_fields = ('title', 'description')

@admin.register(StudentHomeworkSubmission)
class StudentHomeworkSubmissionAdmin(admin.ModelAdmin):
    list_display = ('homework', 'student', 'is_graded', 'submitted_at') # 'status' を 'is_graded' に変更
    list_filter = ('is_graded', 'submitted_at') # 'status' を 'is_graded' に変更
    search_fields = ('homework__title', 'student__username') # student__user__username から student__username に変更 (Userモデルに直接関連するため)

@admin.register(TutorGrading)
class TutorGradingAdmin(admin.ModelAdmin):
    list_display = ('submission', 'tutor', 'score', 'graded_at') # 'grade' を 'score' に変更
    list_filter = ('score', 'graded_at') # 'grade' を 'score' に変更
    search_fields = ('submission__homework__title', 'tutor__username') # tutor__user__username から tutor__username に変更

# 追加: Question と StudentAnswer も Admin に登録する
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('homework', 'question_text', 'question_type', 'order')
    list_filter = ('question_type', 'homework')
    search_fields = ('question_text',)
    raw_id_fields = ('homework',) # 外部キーのIDを直接入力できるようにする（項目が多い場合に便利）

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('submission', 'question', 'text_answer', 'selected_choice_index')
    list_filter = ('question__homework',) # 関連する課題でフィルタリング
    search_fields = ('text_answer', 'submission__student__username')
    raw_id_fields = ('submission', 'question')