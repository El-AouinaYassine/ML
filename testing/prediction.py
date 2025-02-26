import pandas as pd
import joblib

# Load the scaler
scaler = joblib.load('our_scaler.pkl')

# Load the model
model = joblib.load('student_performance_model.pkl')
print("model features :")
print(model.feature_names_in_)
print("----------")

# Load your CSV file (replace 'data.csv' with your file path)
data = pd.read_csv('outpu2t.csv')
print("-----------cols------------")
print(data.columns)
# Example: Assume 'id' and 'target' are not needed
X = data.drop(columns=['Age'])  # Adjust column names as necessary

# Apply the scaler to the data
X_scaled = scaler.transform(X)
# Generate predictions
predictions = model.predict(X_scaled)
# Add predictions to the original DataFrame
data['prediction'] = predictions

# Save results to a new CSV file
data.to_csv('predictions.csv', index=False)
print("Predictions saved to 'predictions.csv'")