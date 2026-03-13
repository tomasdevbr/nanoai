/**
 * App (Composition Root) - Instancia e injeta dependências.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Instanciar Infraestrutura
    const aiService = new GeminiAIService();
    const historyRepo = new IndexedDBRepository();

    // 2. Instanciar Views
    const chatView = new ChatView();
    const historyView = new HistoryView();
    // ModalManager permanece como singleton por simplicidade no DOM
    ModalManager.init();
    
    // 3. Instanciar Controlador (Injeção de Dependência)
    const chatController = new ChatController(
        aiService, 
        historyRepo, 
        chatView, 
        MediaManager, 
        historyView
    );

    // 4. Configurar Eventos Globais (que não cabem apenas em uma View)
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const checkPermissionBtn = document.getElementById('checkPermissionBtn');

    const updateClearBtn = () => {
        const hasText = promptInput.value.length > 0;
        const hasMedia = MediaManager.getSelectedFiles().length > 0;
        clearBtn.style.display = (hasText || hasMedia) ? 'flex' : 'none';
    };

    MediaManager.init(updateClearBtn);

    // Eventos de UI
    promptInput.addEventListener('input', updateClearBtn);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') chatController.sendMessage();
    });

    generateBtn.addEventListener('click', () => chatController.sendMessage());
    
    clearBtn.addEventListener('click', () => {
        chatController.view.setInputValue('');
        chatController.view.clearOutput();
        MediaManager.clear();
        updateClearBtn();
    });

    newChatBtn.addEventListener('click', () => chatController.clearHistory());

    checkPermissionBtn.addEventListener('click', async () => {
        checkPermissionBtn.textContent = "Verificando...";
        await chatController.init();
        checkPermissionBtn.textContent = "Tente novamente";
    });

    // Inicialização
    await chatController.init();
});
