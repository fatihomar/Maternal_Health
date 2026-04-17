from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'vitals-data', views.PregnancyVitalsViewSet, basename='vitals-data')

urlpatterns = [
    # Router mapping for secure ViewSets
    path('', include(router.urls)),

    # Add specific requested endpoint for My Vitals
    path('my-vitals/', views.my_vitals, name='my_vitals'),
    
    # Doctor Endpoints
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/create/', views.create_doctor, name='create_doctor'),
    
    # Appointment Endpoints
    path('appointments/', views.appointment_list, name='appointment_list'),
    path('appointments/create/', views.create_appointment, name='create_appointment'),
    
    # Vitals and ML Predict Endpoints
    path('vitals/predict/', views.create_vitals_predict, name='create_vitals_predict'),
    
    # Dashboard Endpoint
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    
    # Metrics Endpoint
    path('model-metrics/', views.model_metrics_list, name='model_metrics_list'),

    # Auth Endpoints
    path('auth/login/', views.custom_login, name='login'),
    path('auth/me/', views.me, name='me'),
]
