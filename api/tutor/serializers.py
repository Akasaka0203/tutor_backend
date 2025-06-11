# backend/api/tutor/serializers.py

import json # jsonモジュールをインポート
from rest_framework import serializers
from .models import Homework, Question, StudentHomeworkSubmission, StudentAnswer, TutorGrading, LessonSchedule
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
    # questions は ModelSerializer が直接扱うフィールドではないため、ここでは読み込み専用としておく
    # create/update メソッドで手動で処理する
    questions = QuestionSerializer(many=True, required=False, read_only=True) # read_only=True に変更
    attachment_name = serializers.CharField(source='attachment.name', read_only=True, allow_null=True)

    class Meta:
        model = Homework
        fields = ['id', 'title', 'due_date', 'status', 'tutor', 'attachment', 'attachment_name', 'created_at', 'updated_at', 'questions']
        # status, tutor を read_only_fields に戻します
        # views.py の perform_create で設定されるため、シリアライザのバリデーションでは読み取り専用として扱うのが適切です。
        read_only_fields = ['id', 'status', 'tutor', 'created_at', 'updated_at', 'attachment_name']

    def create(self, validated_data):
        # フロントエンドから FormData で送信された 'questions' は文字列として raw data に含まれる
        # validated_data.pop('questions', []) は Model のフィールドにマッピングされるものを想定するため、
        # ここでは機能しない。生の request.data から取得する。
        
        # まず、生のリクエストデータから 'questions' フィールドの文字列を取得
        # self.context['request'].data は MultiPartParser や FormParser によってパースされたデータ
        questions_data_str = self.context['request'].data.get('questions')
        
        questions_list = []
        if questions_data_str:
            try:
                questions_list = json.loads(questions_data_str)
            except json.JSONDecodeError:
                # JSONパースエラーが発生した場合、バリデーションエラーを発生させる
                raise serializers.ValidationError({"questions": "Invalid JSON format for questions data."})

        # validated_data には Homework モデルのフィールドに対応するデータのみが入っていることを確認
        # 'questions' はモデルのフィールドではないため、もし誤って存在しても無視されるか、
        # ここでは既に上記で処理しているため、再度 pop する必要はない
        # ただし、念のため ModelSerializerが処理してしまう可能性を考慮し、validated_dataからはpopしない
        
        # Homework インスタンスを作成
        # tutor は views.py の perform_create で設定されるため、validated_data には含まれないことを想定
        homework = Homework.objects.create(**validated_data)

        # 関連する Question インスタンスを作成
        for i, question_data in enumerate(questions_list):
            # QuestionSerializer を使ってバリデーションすることも可能だが、ここでは直接作成
            # 必要に応じてバリデーションを追加することも検討
            # question_serializer = QuestionSerializer(data=question_data)
            # question_serializer.is_valid(raise_exception=True)
            # Question.objects.create(homework=homework, order=i, **question_serializer.validated_data)
            
            Question.objects.create(
                homework=homework,
                order=i, # フロントエンドからの 'order' は使わず、ループのインデックスを使用
                question_text=question_data.get('question_text'),
                question_type=question_data.get('question_type'),
                choices=question_data.get('choices') # choicesはリストまたはNone
            )
        return homework

    def update(self, instance, validated_data):
        # update メソッドも create メソッドと同様に questions データの処理を修正する
        questions_data_str = self.context['request'].data.get('questions')
        questions_list = []
        if questions_data_str:
            try:
                questions_list = json.loads(questions_data_str)
            except json.JSONDecodeError:
                raise serializers.ValidationError({"questions": "Invalid JSON format for questions data."})

        # Homeworkインスタンスの更新
        instance.title = validated_data.get('title', instance.title)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        # status, tutor, attachment は read_only_fields にあるため、通常はvalidated_dataに含まれない
        # attachment は別途処理
        if 'attachment' in validated_data: # attachment が更新された場合
            instance.attachment = validated_data.get('attachment')
        instance.save()

        # 問題の更新/作成/削除ロジック
        # 既存の問題を全て削除してから新しい問題を作成する簡易的な方法 (既存のorderは失われる)
        instance.questions.all().delete() 
        for i, question_data in enumerate(questions_list): # orderを保持するためenumerate
            Question.objects.create(
                homework=instance,
                order=i,
                question_text=question_data.get('question_text'),
                question_type=question_data.get('question_type'),
                choices=question_data.get('choices')
            )

        # より複雑な更新ロジック (既存IDに基づいて更新/削除/追加) を実装する場合は、
        # ここに追記しますが、まずは簡易的な方法で問題が保存されるか確認するのが良いでしょう。
        # 例：
        # existing_question_ids = set(instance.questions.values_list('id', flat=True))
        # incoming_question_ids = set()
        # for i, q_data in enumerate(questions_list):
        #     q_id = q_data.get('id')
        #     if q_id and q_id in existing_question_ids:
        #         question = Question.objects.get(id=q_id, homework=instance)
        #         question.question_text = q_data.get('question_text', question.question_text)
        #         question.question_type = q_data.get('question_type', question.question_type)
        #         question.choices = q_data.get('choices', question.choices)
        #         question.order = i
        #         question.save()
        #         incoming_question_ids.add(q_id)
        #     else:
        #         Question.objects.create(homework=instance, order=i, **q_data)
        # for q_id_to_delete in existing_question_ids - incoming_question_ids:
        #     Question.objects.filter(id=q_id_to_delete, homework=instance).delete()

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
        # student を read_only_fields に戻します
        read_only_fields = ['id', 'student', 'submitted_at', 'student_attachment_name', 'is_graded']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        # validated_data['student'] = self.context['request'].user の行は不要です。
        # views.py の perform_create で student が設定されます。
        
        submission = StudentHomeworkSubmission.objects.create(**validated_data)
        for answer_data in answers_data:
            StudentAnswer.objects.create(submission=submission, **answer_data)
        return submission

class TutorGradingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorGrading
        fields = ['id', 'submission', 'tutor', 'score', 'feedback', 'graded_at']
        # tutor を read_only_fields に戻します
        read_only_fields = ['id', 'tutor', 'graded_at']

    def create(self, validated_data):
        # validated_data['tutor'] = self.context['request'].user の行は不要です。
        # views.py の perform_create で tutor が設定されます。
        
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
    
    student_submission = serializers.SerializerMethodField()
    tutor_grading = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = [
            'id', 'title', 'due_date', 'status', 'tutor', 
            'attachment', 'attachment_name', 'created_at', 'updated_at',
            'questions', 'student_submission', 'tutor_grading'
        ]
        # tutor を read_only_fields に戻します
        read_only_fields = ['id', 'tutor', 'created_at', 'updated_at', 'attachment_name']

    def get_student_submission(self, obj):
        request = self.context.get('request')
        # request.user.is_authenticated のチェックは維持
        if request and request.user.is_authenticated: 
            try:
                submission = obj.submissions.get(student=request.user)
                # answers もネストして返す場合は、StudentHomeworkSubmissionSerializer に answers フィールドを含める
                return StudentHomeworkSubmissionSerializer(submission, context={'request': request}).data
            except StudentHomeworkSubmission.DoesNotExist:
                return None
        return None

    def get_tutor_grading(self, obj):
        request = self.context.get('request')
        # request.user.is_authenticated のチェックは維持
        if request and request.user.is_authenticated: 
            try:
                submission = obj.submissions.get(student=request.user)
                grading = submission.grading 
                return TutorGradingSerializer(grading, context={'request': request}).data
            except (StudentHomeworkSubmission.DoesNotExist, TutorGrading.DoesNotExist):
                return None
        return None