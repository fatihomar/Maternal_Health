# pylint: disable=no-member
"""
Models for the clinic application.
"""
from django.db import models
from django.conf import settings

class Doctor(models.Model):
    """
    Model representing a doctor.
    """
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)

    def __str__(self):
        return f"Dr. {self.name} - {self.specialty}"

class Patient(models.Model):
    """
    Model representing a patient.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='patient_model'
    )
    full_name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    base_weight = models.FloatField(help_text="Base weight in kg")
    phone_number = models.CharField(max_length=20)

    def __str__(self):
        return str(self.full_name)

class Appointment(models.Model):
    """
    Model representing an appointment.
    """
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Scheduled')

    def __str__(self):
        return f"{self.patient.full_name} - {self.doctor.name} on {self.date}"

class PregnancyVitals(models.Model):
    """
    Model representing pregnancy vitals.
    """
    RISK_LEVEL_CHOICES = [
        ('Low', 'Low'),
        ('Mid', 'Mid'),
        ('High', 'High'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    systolic_bp = models.FloatField(help_text="Systolic Blood Pressure (mmHg)")
    diastolic_bp = models.FloatField(help_text="Diastolic Blood Pressure (mmHg)")
    blood_sugar = models.FloatField(help_text="Blood Sugar Level (mg/dL)")
    body_temp = models.FloatField(help_text="Body Temperature (°C or °F)")
    heart_rate = models.FloatField(help_text="Heart Rate (bpm)")
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES)

    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vitals: {self.patient.full_name} | Risk: {self.risk_level}"

class Prescription(models.Model):
    """
    Model representing a prescription.
    """
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    medication_details = models.TextField()
    date_issued = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Rx for {self.patient.full_name} by {self.doctor.name}"

class ModelMetric(models.Model):
    """
    Model representing model metrics.
    """
    model_name = models.CharField(max_length=255)
    accuracy_score = models.FloatField()

    def __str__(self):
        return f"{self.model_name}: {self.accuracy_score}%"

class UserProfile(models.Model):
    """
    Model representing a user profile.
    """
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Patient', 'Patient'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Patient')
    patient_record = models.OneToOneField(
        'Patient',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profile'
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
