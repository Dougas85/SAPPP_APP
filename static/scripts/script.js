document.addEventListener('DOMContentLoaded', function () {
    // Evento para o botão de mostrar itens
    const calendar = document.getElementById('calendar');
    for (let i = 1; i <= 58; i++) {
        const day = document.createElement('div');
        day.innerText = i;  // Garante que o número do item apareça dentro da bolinha
        day.id = `day-${i}`;
        day.classList.add('calendar-item', 'red-item'); // Classe para estilo e clique
        calendar.appendChild(day);

        // Adicionar evento de clique para exibir detalhes do item sem sorteá-lo
        day.addEventListener("click", function () {
            showItemDetails(i);
        });
    }

    // Lógica para exibir itens de acordo com a data do botão de mostrar itens
    let viewedItems = new Set();

    document.getElementById('showLinesButton').addEventListener('click', function () {
        fetch('/get_lines')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('itemsTable').querySelector('tbody');
                tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos itens

                data.forEach((line) => {
                    const newRow = tableBody.insertRow();
                    const itemCell = newRow.insertCell(0);
                    const actionCell = newRow.insertCell(1);

                    itemCell.innerText = line.descricao || "Sem informação";

                    // Criar botão para abrir o modal
                    const btn = document.createElement('button');
                    btn.innerText = "Ver Detalhes";
                    btn.classList.add('open-dialog');
                    btn.dataset.item = line.descricao || "Sem informação";
                    btn.dataset.orientation = line.orientacao || "Sem orientação";
                    btn.dataset.reference = line.referencia || "Sem referência";

                    actionCell.appendChild(btn);

                    btn.addEventListener('click', function () {
                        document.getElementById('modalItem').innerText = this.dataset.item;
                        document.getElementById('modalOrientation').innerText = this.dataset.orientation;
                        document.getElementById('modalReference').innerText = this.dataset.reference;
                        document.getElementById('dialogBox').showModal();
                    });

                    // Marcar os itens visualizados no calendário
                    const dayElement = document.getElementById(`day-${line.numero}`);
                    if (dayElement) {
                        dayElement.classList.remove('red-item');
                        dayElement.classList.add('viewed'); // Muda para verde
                        viewedItems.add(line.numero);
                    }
                });

                // Resetar calendário se todos os itens foram visualizados
                if (viewedItems.size === 58) {
                    viewedItems.clear();
                    document.querySelectorAll('.calendar-item').forEach(day => {
                        day.classList.remove('viewed');
                        day.classList.add('red-item');
                    });
                }
            })
            .catch(error => console.error("Erro ao carregar os itens:", error));
    });

    // Fechar modal
    document.getElementById('closeDialog').addEventListener('click', function () {
        document.getElementById('dialogBox').close();
    });

    // Função para exibir detalhes ao clicar nos itens vermelhos
    function showItemDetails(itemNum) {
        fetch(`/get_item_details/${itemNum}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Item não encontrado!");
                } else {
                    document.getElementById("modalItem").innerText = data.numero;
                    document.getElementById("modalDescription").innerText = data.descricao;
                    document.getElementById("modalOrientation").innerText = data.orientacao;
                    document.getElementById("modalReference").innerText = data.referencia;

                    document.getElementById("dialogBox").showModal();
                }
            })
            .catch(error => console.error("Erro ao buscar detalhes:", error));
    }

    // Evento para o botão de pesquisa
    document.getElementById('searchButton').addEventListener('click', function () {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();

        if (searchQuery.trim() === "") {
            alert("Por favor, insira uma palavra-chave para pesquisa.");
            return;
        }

        fetch(`/search_items/${searchQuery}`)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('itemsTable').querySelector('tbody');
                tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos itens

                data.forEach((line) => {
                    const newRow = tableBody.insertRow();
                    const itemCell = newRow.insertCell(0);
                    const actionCell = newRow.insertCell(1);

                    itemCell.innerText = line.descricao || "Sem informação";

                    // Criar botão para abrir o modal
                    const btn = document.createElement('button');
                    btn.innerText = "Ver Detalhes";
                    btn.classList.add('open-dialog');
                    btn.dataset.item = line.descricao || "Sem informação";
                    btn.dataset.orientation = line.orientacao || "Sem orientação";
                    btn.dataset.reference = line.referencia || "Sem referência";

                    actionCell.appendChild(btn);

                    btn.addEventListener('click', function () {
                        document.getElementById('modalItem').innerText = this.dataset.item;
                        document.getElementById('modalOrientation').innerText = this.dataset.orientation;
                        document.getElementById('modalReference').innerText = this.dataset.reference;
                        document.getElementById('dialogBox').showModal();
                    });
                });
            })
            .catch(error => console.error("Erro ao buscar os itens:", error));
    });
});
