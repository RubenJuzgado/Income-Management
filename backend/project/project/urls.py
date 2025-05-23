"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
# from django.conf import settings
# from django.views.static import serve
# from django.views.generic import TemplateView
from api.views import *
from django.shortcuts import render
from api.urls import *
from django.conf import settings
from django.conf.urls.static import static

def index_view(request):
    return render(request, "dist/index.html")

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', UserView.as_view(), name="user"),
    path('api/', include('api.urls')),
    path('', index_view, name="index"),
    # re_path(r"^static/(?P<path>.*)$", serve, {"document_root": settings.STATIC_ROOT}), # Quitar luego
    # re_path(
    #     r"^.*$",
    #     TemplateView.as_view(template_name="base.html"),
    # )
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
