import os
import csv
import json

data_dir = r"C:\Users\IUGComp-Aditi\Downloads\IFA_data"
out_dir = r"C:\Users\IUGComp-Aditi\pmmvy_app"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

csv_files = {
    'beneficiaries': 'beneficiaries.csv',
    'supplementationRecords': 'ifa_supplementation_records.csv',
    'pills': 'pills.csv',
    'reviews': 'reviews.csv',
    'states': 'states.csv',
    'transactions': 'transactions.csv'
}

pmmvy_data = {}

for key, filename in csv_files.items():
    filepath = os.path.join(data_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, mode='r', encoding='utf-8') as f:
        # Use DictReader to parse each row as a dictionary
        reader = csv.DictReader(f)
        pmmvy_data[key] = list(reader)

# Write to data.js
out_path = os.path.join(out_dir, "data.js")
with open(out_path, mode='w', encoding='utf-8') as f:
    f.write("// Auto-generated data file from CSV sources\n")
    f.write("const PMMVY_DATA = ")
    json.dump(pmmvy_data, f, indent=2)
    f.write(";\n")

print(f"Successfully generated data.js at {out_path} with keys: {list(pmmvy_data.keys())}")
