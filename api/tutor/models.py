# backend/api/tutor/models.py

from django.db import models
from django.conf import settings # ユーザーモデルを参照するために必要
from django.contrib.auth import get_user_model # 現在のアクティブなユーザーモデルを取得

# ユーザーモデルを取得
User = get_user_model() 

class LessonSchedule(models.Model):
    # ユーザーとの関連付け (将来的に講師と紐づける場合)
    # ここでは、ログインユーザーを指すものと仮定します。
    # 講師ID (UserモデルへのForeignKey)
    # user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_schedules')

    title = models.CharField(max_length=255, verbose_name="タイトル")
    start_time = models.DateTimeField(verbose_name="開始日時")
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="終了日時 (任意)"
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name="説明"
    )
    color = models.CharField(
        max_length=7, # 例: #RRGGBB の形式
        null=True,
        blank=True,
        verbose_name="カレンダーの色"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "授業予定"
        verbose_name_plural = "授業予定"
        ordering = ['start_time'] # 開始日時でソート

    def __str__(self):
        return f"{self.title} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"

# --- 課題管理用モデル ---

class Homework(models.Model):
    """
    課題を表すモデル。
    講師が作成し、生徒に割り当てられる。
    """
    STATUS_CHOICES = [
        ('pending', '未提出'),
        ('submitted', '提出済み'),
        ('completed', '完了'), # 講師が採点・確認済み
    ]

    title = models.CharField(max_length=255, verbose_name="課題名")
    due_date = models.DateField(verbose_name="提出期限")
    # 課題を作成した講師
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_homeworks', verbose_name="作成者(講師)")
    # 課題の現在のステータス
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="ステータス")
    # 課題に添付されるファイル (optional)
    attachment = models.FileField(upload_to='homework_attachments/', blank=True, null=True, verbose_name="課題添付ファイル")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "課題"
        verbose_name_plural = "課題"
        ordering = ['due_date', '-created_at'] # 提出期限が近い順、新しいもの順

    def __str__(self):
        return self.title

class Question(models.Model):
    """
    課題に含まれる問題を表すモデル。
    """
    QUESTION_TYPES = [
        ('text', '文章解答'),
        ('choice', '選択肢'),
    ]

    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='questions', verbose_name="関連課題")
    question_text = models.TextField(verbose_name="問題文")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, verbose_name="問題形式")
    # 選択肢の場合のみ使用。JSONFieldでリストを保存。
    choices = models.JSONField(blank=True, null=True, verbose_name="選択肢 (選択肢形式の場合)")
    order = models.IntegerField(default=0, verbose_name="表示順序") # 問題の表示順

    class Meta:
        verbose_name = "問題"
        verbose_name_plural = "問題"
        ordering = ['homework', 'order'] # 課題ごと、順序ごと

    def __str__(self):
        return f"課題: {self.homework.title} - 問題 {self.order + 1}"

class StudentHomeworkSubmission(models.Model):
    """
    生徒による課題の提出を表すモデル。
    """
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions', verbose_name="提出課題")
    # 提出した生徒
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_homeworks', verbose_name="提出生徒")
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name="提出日時")
    # 生徒が課題に添付したファイル (optional)
    student_attachment = models.FileField(upload_to='student_submissions/', blank=True, null=True, verbose_name="生徒提出ファイル")
    is_graded = models.BooleanField(default=False, verbose_name="採点済み")

    class Meta:
        verbose_name = "生徒課題提出"
        verbose_name_plural = "生徒課題提出"
        unique_together = ('homework', 'student') # 同じ生徒が同じ課題を複数回提出しないようにする
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} の {self.homework.title} 提出"

class StudentAnswer(models.Model):
    """
    生徒の各問題に対する解答を表すモデル。
    """
    submission = models.ForeignKey(StudentHomeworkSubmission, on_delete=models.CASCADE, related_name='answers', verbose_name="関連提出")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers', verbose_name="関連問題")
    text_answer = models.TextField(blank=True, null=True, verbose_name="文章解答")
    selected_choice_index = models.IntegerField(blank=True, null=True, verbose_name="選択肢インデックス") # 選択肢の0-based index

    class Meta:
        verbose_name = "生徒解答"
        verbose_name_plural = "生徒解答"
        unique_together = ('submission', 'question') # 同じ提出で同じ問題に複数回解答しない

    def __str__(self):
        return f"解答: {self.question.question_text[:30]}..."

class TutorGrading(models.Model):
    """
    講師による生徒の提出に対する採点とフィードバックを表すモデル。
    """
    submission = models.OneToOneField(StudentHomeworkSubmission, on_delete=models.CASCADE, related_name='grading', verbose_name="関連提出")
    # 採点した講師
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='graded_submissions', verbose_name="採点者(講師)")
    score = models.CharField(max_length=50, blank=True, null=True, verbose_name="点数/評価") # 例: '80点', 'A', '未採点'
    feedback = models.TextField(blank=True, null=True, verbose_name="フィードバック")
    graded_at = models.DateTimeField(auto_now_add=True, verbose_name="採点日時")

    class Meta:
        verbose_name = "講師採点"
        verbose_name_plural = "講師採点"

    def __str__(self):
        return f"{self.submission.homework.title} の採点 ({self.submission.student.username})"