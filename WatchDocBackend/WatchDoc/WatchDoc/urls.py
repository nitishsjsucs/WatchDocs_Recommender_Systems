"""
URL configuration for WatchDoc project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import path
from main.views import runScans, create_document_and_scan, get_documents, get_document_timeline, get_document_details, make_general_call

urlpatterns = [
    path('runScans/', runScans, name='run_scans'),
    path('createDocumentAndScan/', create_document_and_scan, name='create_document_and_scan'),
    path('documents/', get_documents, name='get_documents'),
    path('documents/<int:document_id>/', get_document_details, name='get_document_details'),
    path('documents/<int:document_id>/timeline/', get_document_timeline, name='get_document_timeline'),
    path('makeGeneralCall/', make_general_call, name='make_general_call'),
    path('admin/', admin.site.urls),
]
