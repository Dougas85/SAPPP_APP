document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');

    for (let i = 1; i <= 67; i++) {
        const day = document.createElement('div');
        day.innerText = i;
        day.id = `day-${i}`;
        calendar.appendChild(day);
    }
});

let viewedItems = new Set();

document.getElementById('showLinesButton').addEventListener('click', function() {
    fetch('/get_lines')
        .then(response => response.json())
        .then(data => {
            const linesContainer = document.getElementById('linesContainer');
            linesContainer.innerHTML = '';

            const tableBody = document.getElementById('itemsTable').querySelector('tbody');

            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }

            data.forEach((line, index) => {
                const newRow = tableBody.insertRow();
                const itemCell = newRow.insertCell(0);
                const actionCell = newRow.insertCell(1);

                itemCell.innerText = line[1] || "Sem informação";

                // Criar botão para abrir o modal
                const btn = document.createElement('button');
                btn.innerText = "Ver Detalhes";
                btn.classList.add('open-dialog');
                btn.dataset.item = line[1] || "Sem informação";
                btn.dataset.orientation = line[5] || "Sem orientação";
                btn.dataset.reference = line[6] || "Sem referência";
                
                actionCell.appendChild(btn);

                btn.addEventListener('click', function() {
                    document.getElementById('modalItem').innerText = this.dataset.item;
                    document.getElementById('modalOrientation').innerText = this.dataset.orientation;
                    document.getElementById('modalReference').innerText = this.dataset.reference;
                    document.getElementById('dialogBox').showModal();
                });

                // Marcar os itens visualizados no calendário
                const dayElement = document.getElementById(`day-${line[0]}`);
                if (dayElement) {
                    dayElement.classList.add('viewed');
                    viewedItems.add(line[0]);
                }
            });

            // Resetar calendário se todos os itens foram visualizados
            if (viewedItems.size === 67) {
                viewedItems.clear();
                document.querySelectorAll('.calendar div').forEach(day => {
                    day.classList.remove('viewed');
                });
            }
        })
        .catch(error => console.error("Erro ao carregar os itens:", error));
});

// Fechar modal
document.getElementById('closeDialog').addEventListener('click', function() {
    document.getElementById('dialogBox').close();
});
