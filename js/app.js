/**
 * App (Entry Point) - Inicializa os módulos e gerencia eventos globais.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Módulos
    ModalManager.init();
    
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

    const handleClear = () => {
        promptInput.value = '';
        MediaManager.clear();
        document.getElementById('output').style.display = 'none';
        updateClearBtn();
    };

    const refreshHistory = () => HistoryUI.load((item) => {
        ChatManager.displayConversation(item);
        updateClearBtn();
    }, handleClear);

    // Eventos
    promptInput.addEventListener('input', updateClearBtn);

    generateBtn.addEventListener('click', () => ChatManager.sendPrompt(refreshHistory));
    
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateBtn.click();
    });

    clearBtn.addEventListener('click', handleClear);

    newChatBtn.addEventListener('click', async () => {
        await AI.resetSession();
        await clearAllHistory();
        handleClear();
        refreshHistory();
        promptInput.placeholder = "Histórico limpo...";
        setTimeout(() => promptInput.placeholder = "Pergunte alguma coisa", 2000);
    });

    // Verificação de Suporte e Download
    async function checkFullStatus() {
        const status = await AI.checkDetailedStatus();
        
        ModalManager.hidePermission();
        ModalManager.hideDownload();

        if (status === "readily") {
            return true;
        } else if (status === "after-download") {
            ModalManager.showDownload();
            try {
                // Inicia o download e monitora o progresso
                await AI.getSession((loaded, total) => {
                    ModalManager.updateDownloadProgress(loaded, total);
                });
                ModalManager.hideDownload();
                return true;
            } catch (err) {
                console.error("Erro no download:", err);
                ModalManager.hideDownload();
                return false;
            }
        } else {
            // Status "unavailable"
            ModalManager.showPermission();
            return false;
        }
    }

    checkPermissionBtn.addEventListener('click', async () => {
        checkPermissionBtn.textContent = "Verificando...";
        await new Promise(r => setTimeout(r, 600));
        if (await checkFullStatus()) {
            checkPermissionBtn.style.backgroundColor = "var(--primary)";
            checkPermissionBtn.textContent = "Ativado!";
            refreshHistory();
        } else {
            checkPermissionBtn.textContent = "Tente novamente";
        }
    });

    // Carga Inicial
    if (await checkFullStatus()) {
        refreshHistory();
    }
});
