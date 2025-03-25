from flask import Flask, render_template, jsonify
import csv
import datetime
import random

app = Flask(__name__)

def get_csv_data():
    with open('data/SAPPP_office.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)
    return rows

def get_current_date():
    return datetime.datetime.now().date()

def get_row_indices_for_today():
    start_date = datetime.date(2023, 1, 1)
    current_date = get_current_date()
    delta_days = (current_date - start_date).days
    rows = get_csv_data()
    total_items = len(rows) - 1  # Subtrai 1 para ignorar o cabeçalho
    random.seed(delta_days)  # Usar delta_days como semente para garantir aleatoriedade acumulativa
    indices = random.sample(range(1, total_items + 1), 2)
    return indices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_lines')
def get_lines():
    rows = get_csv_data()
    indices = get_row_indices_for_today()
    rows_to_show = [rows[indices[0]], rows[indices[1]]]
    return jsonify(rows_to_show)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)