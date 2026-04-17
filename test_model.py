import joblib
import os

model_path = r'c:\Users\moegh\OneDrive\Desktop\sunucu-project\backend\models\maternal_random_forest_model.joblib'

model = joblib.load(model_path)
print("Model classes: ", getattr(model, 'classes_', 'No classes_ attribute'))
