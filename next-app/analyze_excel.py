import pandas as pd
import sys

file_path = r'C:\Users\Jakgrits\project-mgnt\example\ใบเบิกค่าเดินทาง.xlsx'

try:
    # Read the excel file
    # Try to read without header first to see the layout
    df = pd.read_excel(file_path, header=None)
    
    print("=== Excel Content Preview (First 20 rows) ===")
    print(df.head(20).to_string())
    
    print("\n=== Data Info ===")
    print(df.info())

except Exception as e:
    print(f"Error reading excel: {e}")
