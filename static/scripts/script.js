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

                    // Verifica se a descrição está presente
                    const descricao = line.descricao || "Sem informação";
                    itemCell.innerText = `Item ${line.numero}: ${descricao}`;

                    // Criar botão para abrir o modal
                    const btn = document.createElement('button');
                    btn.innerText = "Ver Detalhes";
                    btn.classList.add('open-dialog');

                    // Evento de clique para abrir o modal com os dados corretos
                    btn.addEventListener('click', function () {
                        document.getElementById('modalItem').innerText = `Item ${line.numero}`;
                        document.getElementById('modalOrientation').innerText = line.orientacao || "Sem orientação";
                        document.getElementById('modalReference').innerText = line.referencia || "Sem referência";
                        document.getElementById('modalDescription').innerText = descricao; // Agora exibe a descrição correta
                        document.getElementById('dialogBox').showModal();
                    });

                    actionCell.appendChild(btn);

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

    // Função para exibir detalhes ao clicar nos itens do calendário
    function showItemDetails(itemNum) {
        fetch(`/get_item_details/${itemNum}`)
            .then(response => response.json())
            .then(data => {
                console.log("Detalhes do item:", data);  // Verifique a estrutura dos dados retornados

                if (data.error) {
                    alert("Item não encontrado!");
                } else {
                    // Garantir que todos os dados estejam presentes, incluindo a descrição
                    document.getElementById("modalItem").innerText = `Item ${data.numero}`;
                    document.getElementById("modalOrientation").innerText = data.orientacao || "Sem orientação";
                    document.getElementById("modalReference").innerText = data.referencia || "Sem referência";
                    document.getElementById("modalDescription").innerText = data.descricao || "Sem informação";  // Mostrar descrição no modal

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

                    // Verifica se a descrição está presente
                    const descricao = line.descricao || "Sem informação";
                    itemCell.innerText = `Item ${line.numero}: ${descricao}`;

                    // Criar botão para abrir o modal
                    const btn = document.createElement('button');
                    btn.innerText = "Ver Detalhes";
                    btn.classList.add('open-dialog');

                    // Evento de clique para abrir o modal com os dados corretos
                    btn.addEventListener('click', function () {
                        document.getElementById('modalItem').innerText = `Item ${line.numero}`;
                        document.getElementById('modalOrientation').innerText = line.orientacao || "Sem orientação";
                        document.getElementById('modalReference').innerText = line.referencia || "Sem referência";
                        document.getElementById('modalDescription').innerText = descricao; // Agora exibe a descrição correta
                        document.getElementById('dialogBox').showModal();
                    });

                    actionCell.appendChild(btn);
                });
            })
            .catch(error => console.error("Erro ao buscar os itens:", error));
    });
});



