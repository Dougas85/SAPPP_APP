from flask import Flask, render_template, jsonify
import csv
import datetime
import random
import json
import os

app = Flask(__name__)

SORTED_ITEMS_FILE = "sorted_items.json"
DAILY_SORT_FILE = "daily_sorted.json"

def get_valid_csv_data():
    """Lê o arquivo CSV e retorna os itens válidos."""
    with open('data/SAPPP_office.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)

    valid_rows = []
    numbering = 1  

    for row in rows:
        if row and row[0].isdigit():  
            valid_rows.append([numbering] + row[1:])
            numbering += 1

    return valid_rows

def is_weekday():
    """Verifica se hoje é um dia útil (segunda a sexta)."""
    return datetime.datetime.today().weekday() < 5  # 0 = Segunda, 4 = Sexta

def get_business_day_count():
    """Conta quantos dias úteis já passaram no mês."""
    today = datetime.datetime.today()
    first_day = today.replace(day=1)
    
    business_days = [
        first_day + datetime.timedelta(days=i)
        for i in range((today - first_day).days + 1)
        if (first_day + datetime.timedelta(days=i)).weekday() < 5
    ]
    
    return len(business_days)

def load_sorted_items():
    """Carrega os itens já sorteados do arquivo JSON."""
    if os.path.exists(SORTED_ITEMS_FILE):
        with open(SORTED_ITEMS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_sorted_items(sorted_items):
    """Salva os itens sorteados no arquivo JSON."""
    with open(SORTED_ITEMS_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted_items, f)

def load_daily_sorted_items():
    """Carrega os itens sorteados no dia do arquivo JSON."""
    if os.path.exists(DAILY_SORT_FILE):
        with open(DAILY_SORT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_daily_sorted_items(daily_sorted_items):
    """Salva os itens sorteados no dia no arquivo JSON."""
    with open(DAILY_SORT_FILE, "w", encoding="utf-8") as f:
        json.dump(daily_sorted_items, f)

def get_items_for_today():
    """Sorteia dois itens por dia útil, garantindo que não se repitam até zerar."""
    if not is_weekday():
        return []  

    rows = get_valid_csv_data()
    total_items = len(rows)
    
    if total_items < 2:
        return []  

    sorted_items = load_sorted_items()
    daily_sorted_items = load_daily_sorted_items()

    # Conta quantos dias úteis se passaram
    business_day_count = get_business_day_count()

    # Se for o dia útil 30, reinicia todos os itens
    if business_day_count == 30:
        sorted_items = []  
        daily_sorted_items = []  
        save_sorted_items(sorted_items)
        save_daily_sorted_items(daily_sorted_items)

    # Se já foram sorteados 2 itens hoje, não faz novo sorteio
    if len(daily_sorted_items) >= 2:
        return [row for row in rows if row[0] in daily_sorted_items]

    # Se todos os itens já foram sorteados, reinicia
    if len(sorted_items) >= total_items:
        sorted_items = []  
        save_sorted_items(sorted_items)

    # Sorteia 2 novos itens sem repetir
    remaining_items = [row for row in rows if row[0] not in sorted_items]
    random.shuffle(remaining_items)
    selected = remaining_items[:2]  

    # Atualiza a lista de sorteados e salva
    sorted_items.extend([item[0] for item in selected])
    daily_sorted_items.extend([item[0] for item in selected])

    save_sorted_items(sorted_items)
    save_daily_sorted_items(daily_sorted_items)

    return selected

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_lines')
def get_lines():
    """Retorna os itens do dia."""
    rows_to_show = get_items_for_today()

    formatted_data = [
        {
            "descricao": item[1],  
            "numero": item[0],   
            "orientacao": item[5] if len(item) > 5 else "Sem orientação",  
            "referencia": item[6] if len(item) > 6 else "Sem referência"
        }
        for item in rows_to_show
    ]

    return jsonify(formatted_data)

@app.route('/get_item_details/<int:item_num>')
def get_item_details(item_num):
    """Retorna os detalhes de um item específico sem sorteá-lo."""
    rows = get_valid_csv_data()

    # Busca o item pelo número
    item = next((row for row in rows if row[0] == item_num), None)

    if item:
        details = {
            "descricao": item[1],  
            "numero": item[0],   
            "orientacao": item[5] if len(item) > 5 else "Sem orientação",  
            "referencia": item[6] if len(item) > 6 else "Sem referência"
        }
        return jsonify(details)
    
    return jsonify({"error": "Item não encontrado"}), 404


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
