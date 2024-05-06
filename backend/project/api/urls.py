from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register, name="api_register"),
    path("login/", views.login, name="api_login"),
    path("create_container/", views.create_container, name="api_create_container"),
    path("get_containers/", views.get_containers, name="api_get_containers"),
    path("update_container/", views.update_container, name="api_update_container_money"),
    path("delete_container/", views.delete_container, name="api_delete_container"),
    path("get_savings_goals/", views.get_savings_goals, name="api_get_savings_goals"),
    path("create_savings_goal/", views.create_savings_goal, name="api_create_savings_goal"),
    path("delete_savings_goal/", views.delete_savings_goal, name="api_delete_savings_goal"),
    path("update_savings_goal/", views.update_savings_goal, name="api_update_savings_goal"),
    path("complete_savings_goal/", views.complete_savings_goal, name="api_complete_savings_goal"),
    path("get_savings/", views.get_savings, name="api_get_savings"),
]