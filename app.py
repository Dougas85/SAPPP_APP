from flask import Flask, render_template, jsonify
import csv
import datetime
import random

app = Flask(__name__)

def get_valid_csv_data():
    """Lê o arquivo CSV e retorna apenas os itens válidos, numerando corretamente."""
    with open('data/SAPPP_office.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)
    
    valid_rows = []
    numbering = 1  # Numeração única de 1 até o total de itens
    
    for row in rows:
        if row and row[0].isdigit():  # Verifica se a primeira coluna é um número válido
            valid_rows.append([numbering] + row[1:])  # Adiciona a numeração correta
            numbering += 1

    return valid_rows

def get_current_date():
    """Retorna a data atual."""
    return datetime.datetime.now().date()

def get_row_indices_for_today():
    """Seleciona aleatoriamente 2 itens diferentes para o dia de hoje."""
    rows = get_valid_csv_data()
    total_items = len(rows)

    if total_items < 2:
        return []  # Evita erro caso haja poucos itens

    start_date = datetime.date(2023, 1, 1)
    current_date = get_current_date()
    delta_days = (current_date - start_date).days
    
    random.seed(delta_days)  # Usa um seed fixo para manter aleatoriedade diária
    indices = random.sample(range(total_items), 2)  # Sorteia 2 índices diferentes

    return indices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_lines')
def get_lines():
    """Retorna os itens sorteados com as informações corretas."""
    rows = get_valid_csv_data()
    indices = get_row_indices_for_today()
    
    rows_to_show = []
    for index in indices:
        item = rows[index]
        rows_to_show.append({
            "descricao": item[2],    # Mostra a descrição completa do item na lista principal
            "numero": item[1],       # Número correto do item (1 a 58)
            "orientacao": item[-3],  # Coluna correta da orientação
            "referencia": item[-2]   # Última coluna do CSV (Referência)
        })
    
    return jsonify(rows_to_show)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
