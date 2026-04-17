from rest_framework import serializers
from .models import Doctor, Patient, Appointment, PregnancyVitals, Prescription, ModelMetric

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
