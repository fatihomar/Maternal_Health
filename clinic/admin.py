from django.contrib import admin
from .models import Doctor, Patient, Appointment, PregnancyVitals, Prescription

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'phone_number')
    search_fields = ('name', 'specialty', 'phone_number')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'age', 'base_weight', 'phone_number')
    search_fields = ('full_name', 'phone_number')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'time', 'status')
    list_filter = ('status', 'date', 'doctor')
    search_fields = ('patient__full_name', 'doctor__name')
    date_hierarchy = 'date'

@admin.register(PregnancyVitals)
class PregnancyVitalsAdmin(admin.ModelAdmin):
    list_display = ('patient', 'systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_temp', 'heart_rate', 'risk_level', 'recorded_at')
    list_filter = ('risk_level', 'recorded_at')
    search_fields = ('patient__full_name',)
    date_hierarchy = 'recorded_at'

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date_issued')
    list_filter = ('date_issued', 'doctor')
    search_fields = ('patient__full_name', 'doctor__name', 'medication_details')
