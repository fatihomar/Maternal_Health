from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
import os
import joblib

from .permissions import IsAdminOrStaff, IsPatient, IsOwner
from .models import Doctor, Patient, Appointment, PregnancyVitals, Prescription, ModelMetric
from .serializers import (
    DoctorSerializer, PatientSerializer, AppointmentSerializer, 
    PregnancyVitalsSerializer, VitalsPredictSerializer, ModelMetricSerializer
)

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsOwner]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'Admin':
            return Patient.objects.all().order_by('-id')
        return Patient.objects.filter(user=user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PregnancyVitalsViewSet(viewsets.ModelViewSet):
    serializer_class = PregnancyVitalsSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsOwner]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'Admin':
            return PregnancyVitals.objects.all().order_by('-recorded_at')
        return PregnancyVitals.objects.filter(patient__user=user).order_by('-recorded_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_vitals(request):
    vitals = PregnancyVitals.objects.filter(patient__user=request.user).order_by('-recorded_at')
    serializer = PregnancyVitalsSerializer(vitals, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def custom_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        role = user.profile.role if hasattr(user, 'profile') else 'Visitor'
        
        patient_record_id = None
        if hasattr(user, 'patient_model') and user.patient_model:
            patient_record_id = user.patient_model.id

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': role,
            'patient_id': patient_record_id,
            'name': user.get_full_name() or user.username
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    role = user.profile.role if hasattr(user, 'profile') else 'Visitor'
    
    patient_data = None
    if hasattr(user, 'patient_model') and user.patient_model is not None:
        patient_data = PatientSerializer(user.patient_model).data

    return Response({
        'id': user.id,
        'username': user.username,
        'name': user.get_full_name() or user.username,
        'email': user.email,
        'role': role,
        'patient_data': patient_data,
    })

@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def dashboard_stats(request):
    data = {
        'total_patients': Patient.objects.count(),
        'total_doctors': Doctor.objects.count(),
        'total_appointments': Appointment.objects.count(),
        'total_vitals_recorded': PregnancyVitals.objects.count()
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def doctor_list(request):
    doctors = Doctor.objects.all().order_by('name')
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminOrStaff])
def create_doctor(request):
    serializer = DoctorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    if hasattr(request.user, 'profile') and request.user.profile.role == 'Patient':
        if hasattr(request.user, 'patient_model'):
            appointments = Appointment.objects.filter(patient=request.user.patient_model).order_by('-date', '-time')
        else:
            appointments = Appointment.objects.none()
    else:
        appointments = Appointment.objects.all().order_by('-date', '-time')
        
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminOrStaff])
def create_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminOrStaff])
def create_vitals_predict(request):
    serializer = VitalsPredictSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    data = serializer.validated_data
    patient = get_object_or_404(Patient, pk=data['patient_id'])
    
    features = [[
        patient.age,
        data['systolic_bp'],
        data['diastolic_bp'],
        data['blood_sugar'],
        data['body_temp'],
        data['heart_rate']
    ]]
    
    try:
        model_dir = os.path.join(settings.BASE_DIR, 'backend', 'models')
        
        scaler = joblib.load(os.path.join(model_dir, 'maternal_scaler.joblib'))
        rf_model = joblib.load(os.path.join(model_dir, 'maternal_random_forest_model.joblib'))
        dt_model = joblib.load(os.path.join(model_dir, 'maternal_decision_tree_model.joblib'))
        knn_model = joblib.load(os.path.join(model_dir, 'maternal_knn_model.joblib'))
        nb_model = joblib.load(os.path.join(model_dir, 'maternal_naive_bayes_model.joblib'))
        
        scaled_features = scaler.transform(features)
        mapping = {0: 'High', 1: 'Low', 2: 'Mid'}
        
        rf_pred = mapping.get(rf_model.predict(scaled_features)[0], 'Unknown')
        dt_pred = mapping.get(dt_model.predict(scaled_features)[0], 'Unknown')
        knn_pred = mapping.get(knn_model.predict(scaled_features)[0], 'Unknown')
        nb_pred = mapping.get(nb_model.predict(scaled_features)[0], 'Unknown')
        
        all_predictions = {
            "Random Forest": rf_pred,
            "Decision Tree": dt_pred,
            "K-Nearest Neighbors": knn_pred,
            "Naive Bayes": nb_pred
        }
        
    except Exception as e:
        return Response({'model_error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    vitals_record = PregnancyVitals.objects.create(
        patient=patient,
        systolic_bp=data['systolic_bp'],
        diastolic_bp=data['diastolic_bp'],
        blood_sugar=data['blood_sugar'],
        body_temp=data['body_temp'],
        heart_rate=data['heart_rate'],
        risk_level=rf_pred
    )
    
    final_serializer = PregnancyVitalsSerializer(vitals_record)
    
    return Response({
        'message': 'Vitals analyzed and logged successfully!',
        'predicted_risk_level': rf_pred,
        'all_predictions': all_predictions,
        'record': final_serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def model_metrics_list(request):
    metrics = ModelMetric.objects.all().order_by('-accuracy_score')
    serializer = ModelMetricSerializer(metrics, many=True)
    return Response(serializer.data)
