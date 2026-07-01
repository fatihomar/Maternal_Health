from rest_framework import serializers
from .models import Doctor, Patient, Appointment, PregnancyVitals, Prescription, ModelMetric, ActivityLog

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    # To return full patient and doctor details in GET but only accept ID in POST
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

    def validate(self, data):
        doctor = data.get('doctor')
        date = data.get('date')
        time = data.get('time')
        status_val = data.get('status', 'Scheduled')

        # Only check for conflicts if the appointment is being scheduled
        if status_val == 'Scheduled':
            # Check if there is an existing appointment for the same doctor at the same date and time
            conflict = Appointment.objects.filter(
                doctor=doctor, 
                date=date, 
                time=time, 
                status='Scheduled'
            )
            
            # If this is an update, exclude the current instance from the conflict check
            if self.instance:
                conflict = conflict.exclude(pk=self.instance.pk)
                
            if conflict.exists():
                raise serializers.ValidationError("This time slot is already booked for this doctor.")
        
        return data

class PregnancyVitalsSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)

    class Meta:
        model = PregnancyVitals
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

# Custom Serializer strictly for accepting input into the ML prediction endpoint
class VitalsPredictSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField(help_text="ID of the associated patient")
    systolic_bp = serializers.FloatField()
    diastolic_bp = serializers.FloatField()
    blood_sugar = serializers.FloatField()
    body_temp = serializers.FloatField()
    heart_rate = serializers.FloatField()

class ModelMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelMetric
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = '__all__'
