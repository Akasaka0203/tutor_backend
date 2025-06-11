# backend/api/tutor/serializers.py
from rest_framework import serializers
from .models import LessonSchedule

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class LessonScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonSchedule
        fields = ['id', 'title', 'start_time', 'end_time', 'description', 'color', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']