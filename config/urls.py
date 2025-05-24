from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/hello/', include('api.hello.urls')),
    path('api/hello_db/',include('api.hello_db.urls')),
]