# backend/config/settings/base.py

import os
from pathlib import Path # Pathモジュールも使用

# BASE_DIRの調整: settings.pyの場所 (config/settings/base.py) から manage.py があるプロジェクトルート (backend/) への相対パス
# backend/config/settings/base.py から 'backend' まで2つ上の階層、さらに 'backend' ディレクトリ自体を指す
# Path(__file__).resolve().parent.parent.parent で 'backend' ディレクトリを指す
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-wel@_!%$*udgeetcj3d82x94fyu73ri@31#l4p3z06&rj4c7k2" # ★★★ 本番環境ではより強力なキーを設定してください ★★★

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1'] # 必要に応じてフロントエンドのホストも追加


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',        # Django REST Framework
    'corsheaders',           # CORSヘッダーを扱うためのアプリ
    'api.tutor',                 # 'tutor' アプリケーション自体も登録
    'api.hello.apps.HelloConfig',    
    'api.hello_db.apps.HelloDbConfig'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # CORSミドルウェアを可能な限り上位に配置
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS設定
# ★★★ ここをあなたのNext.jsフロントエンドのURLに合わせて変更してください ★★★
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # Next.jsのデフォルト開発サーバーのURL
]
CORS_ALLOW_CREDENTIALS = True # クッキー（セッションID）を送信するために必要


# ROOT_URLCONF: プロジェクトのメインurls.pyの場所
ROOT_URLCONF = 'config.urls' # ★★★ プロジェクトルートの urls.py を指します ★★★

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug', # 追加: 開発時ログ表示のため
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI_APPLICATION: プロジェクトのwsgi.pyの場所
WSGI_APPLICATION = 'config.wsgi.application' # ★★★ プロジェクトルートの wsgi.py を指します ★★★


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your_database_name',       # MySQLで作成するデータベース名
        'USER': 'your_mysql_user',         # MySQLのユーザー名
        'PASSWORD': 'your_mysql_password', # MySQLのパスワード
        'HOST': 'localhost',               # MySQLサーバーのホスト（通常はlocalhost）
        'PORT': '3306',                    # MySQLサーバーのポート（通常は3306）
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/topics/auth/passwords/

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'ja' # 日本語化
TIME_ZONE = 'Asia/Tokyo' # タイムゾーン設定
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework の設定
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        #'rest_framework.authentication.SessionAuthentication', # セッションベース認証
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # 開発中は一時的にすべてのAPIを許可。本番では変更すること。
    ]
}

LOGIN_URL = '/admin/login/'
LOGOUT_REDIRECT_URL = '/'

# ロギング設定 (デバッグ用)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        }
    },
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
        'django.request': { # HTTPリクエストに関するログ
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    }
}