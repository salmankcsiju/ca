from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'diaries', views.ClientDiaryViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'staff', views.StaffViewSet, basename='staff')
router.register(r'logs', views.ActivityLogViewSet, basename='logs')
router.register(r'customers', views.CustomerViewSet, basename='customers')
router.register(r'customization-options', views.CustomizationOptionViewSet, basename='customization-options')
router.register(r'messages', views.ChatMessageViewSet, basename='messages')
router.register(r'settings', views.AtelierSettingViewSet, basename='settings')


urlpatterns = [
    path('auth/login/', views.login_or_register, name='login_or_register'),
    path('auth/me/', views.get_user_profile, name='user_profile'),
    path('auth/admin/token/', obtain_auth_token, name='admin_token'),
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
    path('', include(router.urls)),
]
