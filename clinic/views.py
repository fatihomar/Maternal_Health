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
from .models import Doctor, Patient, Appointment, PregnancyVitals, Prescription, ModelMetric, ActivityLog
from .serializers import (
    DoctorSerializer, PatientSerializer, AppointmentSerializer, 
    PregnancyVitalsSerializer, VitalsPredictSerializer, ModelMetricSerializer, ActivityLogSerializer
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

        ActivityLog.objects.create(
            user=user,
            action_type="LOGIN",
            description=f"{role} logged in successfully."
        )

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': role,
            'patient_id': patient_record_id,
            'name': user.get_full_name() or user.username
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def register_patient(request):
    from django.contrib.auth.models import User
    from .models import UserProfile, Patient
    from django.db import transaction

    data = request.data
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('full_name')
    age = data.get('age')
    base_weight = data.get('base_weight')
    phone_number = data.get('phone_number')

    if not all([username, password, full_name, age, base_weight, phone_number]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(username=username, password=password, first_name=full_name)
            
            # Create Patient record
            patient = Patient.objects.create(
                user=user,
                full_name=full_name,
                age=int(age),
                base_weight=float(base_weight),
                phone_number=phone_number
            )
            
            # Create UserProfile with role 'Patient'
            UserProfile.objects.create(
                user=user,
                role='Patient',
                patient_record=patient
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Patient registered successfully!',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': 'Patient',
                'patient_id': patient.id,
                'name': full_name
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
        
    user = request.user
    role = user.profile.role if hasattr(user, 'profile') else 'Visitor'
    
    status_val = request.data.get('status')
    if not status_val:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    # Validation based on role
    if role == 'Patient':
        # Patients can only cancel their own appointments
        if not hasattr(user, 'patient_model') or appointment.patient != user.patient_model:
            return Response({'error': 'You can only cancel your own appointments.'}, status=status.HTTP_403_FORBIDDEN)
        if status_val != 'Cancelled':
            return Response({'error': 'Patients can only cancel appointments.'}, status=status.HTTP_403_FORBIDDEN)
            
    # Admin can change to any status
    
    appointment.status = status_val
    appointment.save()
    
    # Log activity
    ActivityLog.objects.create(
        user=user,
        action_type="APPOINTMENT_CANCELLED" if status_val == "Cancelled" else "APPOINTMENT_UPDATED",
        description=f"Appointment with {appointment.doctor.name} was marked as {status_val}."
    )
    
    serializer = AppointmentSerializer(appointment)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_emergency_appointment(request):
    from datetime import date, timedelta, time
    user = request.user
    if not hasattr(user, 'profile') or user.profile.role != 'Patient':
        return Response({'error': 'Only patients can book emergency appointments.'}, status=status.HTTP_403_FORBIDDEN)
    
    patient = user.patient_model
    if not patient:
        return Response({'error': 'Patient record not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    doctor = Doctor.objects.first()
    if not doctor:
        return Response({'error': 'No doctors available currently.'}, status=status.HTTP_404_NOT_FOUND)
        
    tomorrow = date.today() + timedelta(days=1)
    
    # Intelligently find the next available slot for this doctor
    # We will check the next 7 days, from 9:00 AM to 4:30 PM, every 30 minutes
    appointment_time = None
    appointment_date = None
    
    for day_offset in range(7):
        current_date = tomorrow + timedelta(days=day_offset)
        
        for hour in range(9, 17): # 9 AM to 4 PM
            for minute in (0, 30):
                slot_time = time(hour, minute)
                # Check if slot is taken
                is_taken = Appointment.objects.filter(
                    doctor=doctor, 
                    date=current_date, 
                    time=slot_time, 
                    status='Scheduled'
                ).exists()
                
                if not is_taken:
                    appointment_date = current_date
                    appointment_time = slot_time
                    break
            if appointment_date:
                break
        if appointment_date:
            break
            
    if not appointment_date:
        return Response({'error': 'No available slots in the next 7 days.'}, status=status.HTTP_404_NOT_FOUND)
        
    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        date=appointment_date,
        time=appointment_time,
        status='Scheduled'
    )
    
    ActivityLog.objects.create(
        user=user,
        action_type="EMERGENCY_BOOK",
        description=f"Patient {patient.full_name} booked an EMERGENCY appointment."
    )
    
    serializer = AppointmentSerializer(appointment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    user = request.user
    if not hasattr(user, 'profile') or user.profile.role != 'Patient':
        return Response({'error': 'Only patients can book appointments.'}, status=status.HTTP_403_FORBIDDEN)
    
    patient = user.patient_model
    if not patient:
        return Response({'error': 'Patient record not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Find any doctor if none specified
    doctor_id = request.data.get('doctor_id')
    if doctor_id:
        doctor = Doctor.objects.filter(id=doctor_id).first()
    else:
        doctor = Doctor.objects.first()
        
    if not doctor:
        return Response({'error': 'No doctors available currently.'}, status=status.HTTP_404_NOT_FOUND)

    date = request.data.get('date')
    time = request.data.get('time')
    
    if not date or not time:
        return Response({'error': 'Date and time are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    # Check if slot is taken
    is_taken = Appointment.objects.filter(
        doctor=doctor, 
        date=date, 
        time=time, 
        status='Scheduled'
    ).exists()
    
    if is_taken:
        return Response({'error': 'This time slot is already booked.'}, status=status.HTTP_400_BAD_REQUEST)
        
    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        date=date,
        time=time,
        status='Scheduled'
    )
    
    ActivityLog.objects.create(
        user=user,
        action_type="BOOK_APPOINTMENT",
        description=f"Patient {patient.full_name} booked a regular appointment."
    )
    
    serializer = AppointmentSerializer(appointment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vitals_predict(request):
    serializer = VitalsPredictSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    data = serializer.validated_data
    
    # If the user is a Patient, they can only predict for themselves
    user = request.user
    if hasattr(user, 'profile') and user.profile.role == 'Patient':
        if hasattr(user, 'patient_model') and user.patient_model.id != data['patient_id']:
            return Response({'error': 'You can only predict vitals for yourself.'}, status=status.HTTP_403_FORBIDDEN)
            
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
    
    ActivityLog.objects.create(
        user=request.user,
        action_type="PREDICTION_RUN",
        description=f"Risk prediction run for {patient.full_name}. Result: {rf_pred} Risk."
    )
    
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

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
        
    user.save()
    
    # Also update patient full name if patient
    if hasattr(user, 'patient_model') and user.patient_model:
        user.patient_model.full_name = f"{user.first_name} {user.last_name}".strip()
        
        phone_number = request.data.get('phone_number')
        base_weight = request.data.get('base_weight')
        if phone_number is not None:
            user.patient_model.phone_number = phone_number
        if base_weight is not None:
            user.patient_model.base_weight = base_weight
            
        user.patient_model.save()
        
    ActivityLog.objects.create(
        user=user,
        action_type="PROFILE_UPDATE",
        description="Updated personal profile name."
    )
        
    return Response({
        "message": "Profile updated successfully.",
        "name": user.get_full_name() or user.username
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_logs_list(request):
    user = request.user
    if hasattr(user, 'profile') and user.profile.role == 'Admin':
        logs = ActivityLog.objects.all().order_by('-timestamp')[:50] # Last 50 clinic actions
    else:
        logs = ActivityLog.objects.filter(user=user).order_by('-timestamp')[:50]
        
    serializer = ActivityLogSerializer(logs, many=True)
    return Response(serializer.data)
