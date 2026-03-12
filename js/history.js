const HistoryUI = (() => {
    async function load(onLoadConversation, onDeleteConversation) {
        try {
            const history = await getHistory(); // relies on db.js
            const historyList = document.getElementById('historyList');

            if (!historyList) return;

            if (history.length === 0) {
                historyList.innerHTML = '<p class="empty-history">Nenhuma conversa salva ainda.</p>';
                return;
            }

            historyList.innerHTML = '';
            history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';

                const date = new Date(item.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                });

                div.innerHTML = `
                    <div class="history-item-content">
                        <strong>${item.question}</strong>
                        <span>${date}</span>
                    </div>
                    <button class="delete-history-btn" aria-label="Excluir Histórico" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;

                div.querySelector('.history-item-content').addEventListener('click', () => {
                    onLoadConversation(item.question, item.answer);
                });

                const deleteBtn = div.querySelector('.delete-history-btn');
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await deleteConversation(item.id); // relies on db.js
                    if (onDeleteConversation) onDeleteConversation();
                    load(onLoadConversation, onDeleteConversation);
                });

                historyList.appendChild(div);
            });
        } catch (e) {
            console.error("Erro ao carregar histórico", e);
        }
    }

    return { load };
})();
