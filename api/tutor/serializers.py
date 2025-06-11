# backend/api/tutor/serializers.py

from rest_framework import serializers
from .models import Homework, Question, StudentHomeworkSubmission, StudentAnswer, TutorGrading, LessonSchedule # LessonScheduleを忘れずにインポート
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class LessonScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonSchedule
        fields = ['id', 'title', 'start_time', 'end_time', 'description', 'color', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

# --- 課題管理用シリアライザー ---

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'choices', 'order']
        read_only_fields = ['id'] # IDは作成時に自動生成

class HomeworkSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False) # 関連する問題をネスト
    attachment_name = serializers.CharField(source='attachment.name', read_only=True, allow_null=True) # フロントエンドのattachmentNameに対応

    class Meta:
        model = Homework
        fields = ['id', 'title', 'due_date', 'status', 'tutor', 'attachment', 'attachment_name', 'created_at', 'updated_at', 'questions']
        read_only_fields = ['id', 'status', 'tutor', 'created_at', 'updated_at', 'attachment_name']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        # 講師情報を取得 (リクエストユーザーから設定)
        # TODO: 実際のユーザー認証とロールに基づいて、リクエストユーザーをtutorとして設定
        # 例: request.user が講師であると仮定
        validated_data['tutor'] = self.context['request'].user 
        homework = Homework.objects.create(**validated_data)
        for i, question_data in enumerate(questions_data):
            Question.objects.create(homework=homework, order=i, **question_data) # orderを追加
        return homework

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])

        # Homeworkインスタンスの更新
        instance.title = validated_data.get('title', instance.title)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        # status, attachment, tutor は直接更新しないことが多いが、必要に応じて含める
        if 'attachment' in validated_data:
            instance.attachment = validated_data.get('attachment')
        instance.save()

        # 問題の更新/作成/削除
        # 既存の問題IDをセットに格納
        existing_question_ids = set([q.id for q in instance.questions.all()])
        incoming_question_ids = set()

        for i, q_data in enumerate(questions_data): # orderを保持するためenumerate
            q_id = q_data.get('id')
            if q_id and q_id in existing_question_ids:
                # 既存の問題を更新
                question = Question.objects.get(id=q_id, homework=instance)
                question.question_text = q_data.get('question_text', question.question_text)
                question.question_type = q_data.get('question_type', question.question_type)
                question.choices = q_data.get('choices', question.choices)
                question.order = i # 更新時もorderを再設定
                question.save()
                incoming_question_ids.add(q_id)
            else:
                # 新しい問題を作成
                Question.objects.create(homework=instance, order=i, **q_data) # orderを追加

        # 削除された問題の処理
        for q_id in existing_question_ids - incoming_question_ids:
            Question.objects.get(id=q_id, homework=instance).delete()

        return instance

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['question', 'text_answer', 'selected_choice_index']

class StudentHomeworkSubmissionSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True) # 関連する解答をネスト
    student_attachment_name = serializers.CharField(source='student_attachment.name', read_only=True, allow_null=True)
    
    class Meta:
        model = StudentHomeworkSubmission
        fields = ['id', 'homework', 'student', 'submitted_at', 'student_attachment', 'student_attachment_name', 'is_graded', 'answers']
        read_only_fields = ['id', 'student', 'submitted_at', 'student_attachment_name', 'is_graded']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        # TODO: request.user から student を設定
        validated_data['student'] = self.context['request'].user 
        submission = StudentHomeworkSubmission.objects.create(**validated_data)
        for answer_data in answers_data:
            StudentAnswer.objects.create(submission=submission, **answer_data)
        return submission

class TutorGradingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorGrading
        fields = ['id', 'submission', 'tutor', 'score', 'feedback', 'graded_at']
        read_only_fields = ['id', 'tutor', 'graded_at']

    def create(self, validated_data):
        # TODO: request.user から tutor を設定
        validated_data['tutor'] = self.context['request'].user 
        grading = TutorGrading.objects.create(**validated_data)
        # 採点後、提出のis_gradedをTrueに設定
        submission = grading.submission
        submission.is_graded = True
        submission.save()
        return grading

    def update(self, instance, validated_data):
        instance.score = validated_data.get('score', instance.score)
        instance.feedback = validated_data.get('feedback', instance.feedback)
        instance.save()
        return instance

# 課題詳細表示用のシリアライザー（ネストされたデータを全て含む）
class HomeworkDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    attachment_name = serializers.CharField(source='attachment.name', read_only=True, allow_null=True)
    
    # 生徒の提出と採点データをネストして表示
    # ここでは、特定の生徒の提出と採点のみを表示するロジックが必要になる
    # そのため、SerializerMethodField を使用して、リクエストユーザーに応じたデータを取得する
    student_submission = serializers.SerializerMethodField()
    tutor_grading = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = [
            'id', 'title', 'due_date', 'status', 'tutor', 
            'attachment', 'attachment_name', 'created_at', 'updated_at',
            'questions', 'student_submission', 'tutor_grading'
        ]
        read_only_fields = ['id', 'tutor', 'created_at', 'updated_at', 'attachment_name']

    def get_student_submission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                # この課題と、現在リクエストしている生徒の提出を取得
                submission = obj.submissions.get(student=request.user)
                # StudentHomeworkSubmissionSerializer を使用してシリアライズ
                return StudentHomeworkSubmissionSerializer(submission, context={'request': request}).data
            except StudentHomeworkSubmission.DoesNotExist:
                return None
        return None

    def get_tutor_grading(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                # この課題と、現在リクエストしている生徒の提出を取得
                submission = obj.submissions.get(student=request.user)
                grading = submission.grading # OneToOneFieldなので直接アクセス
                # TutorGradingSerializer を使用してシリアライズ
                return TutorGradingSerializer(grading, context={'request': request}).data
            except (StudentHomeworkSubmission.DoesNotExist, TutorGrading.DoesNotExist):
                return None
        return None