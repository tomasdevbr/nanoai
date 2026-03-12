const output = document.getElementById('output');
const btn = document.getElementById('generateBtn');
const input = document.getElementById('promptInput');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const permissionModal = document.getElementById('permissionModal');
const checkPermissionBtn = document.getElementById('checkPermissionBtn');
const downloadModal = document.getElementById('downloadModal');
const downloadPercentage = document.getElementById('downloadPercentage');
const downloadProgress = document.getElementById('downloadProgress');
const downloadBytes = document.getElementById('downloadBytes');

// Mostra ou esconde o botão "X" conforme a pessoa digita
input.addEventListener('input', () => {
    clearBtn.style.display = input.value.length > 0 ? 'flex' : 'none';
});

// Limpa o campo ao clicar no "X"
clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    output.style.display = 'none'; // Esconde o card da resposta
    input.focus();
});

// Facilita o envio pressionando 'Enter'
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btn.click();
    }
});

function loadConversation(question, answerMarkdown) {
    input.value = question;
    clearBtn.style.display = 'flex';
    output.style.display = 'block';
    output.innerHTML = MarkdownViewer.render(answerMarkdown);
}

btn.addEventListener('click', async () => {
    const question = input.value.trim();
    if (!question) {
        input.focus();
        return;
    }

    btn.disabled = true;
    output.style.display = 'none'; // Ensure it's hidden initially
    loadingIndicator.style.display = 'flex'; // Show our standalone spinner

    try {
        let isDownloading = false;
        try {
            const availability = await LanguageModel.availability();
            isDownloading = (availability === 'after-download');
        } catch(e) {}

        function formatBytes(bytes, decimals = 1) {
            if (!bytes || bytes === 0) return '0 B';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        let tokenCount = 0;
        const fullText = await AI.generateResponse(question, (text) => {
            tokenCount++;
            
            if (isDownloading) {
                downloadModal.style.display = 'none';
                isDownloading = false;
            }

            // Only show output card and hide spinner once we have at least 2 tokens
            if (tokenCount >= 2) {
                loadingIndicator.style.display = 'none';
                output.style.display = 'block';
                output.innerHTML = MarkdownViewer.render(text);
            }
        }, (percentage, loaded, total) => {
            if (isDownloading) {
                loadingIndicator.style.display = 'none'; // Esconde o spinner central de imediato
                downloadModal.style.display = 'flex';    // Mostra a modal por cima de tudo
                downloadPercentage.textContent = isNaN(percentage) ? 0 : percentage;
                downloadProgress.value = isNaN(percentage) ? 0 : percentage;
                
                const loadedStr = formatBytes(loaded);
                const totalStr = total > 0 ? formatBytes(total) : '?';
                downloadBytes.textContent = `${loadedStr} / ${totalStr}`;
            }
        });

        // Se a geração terminar em sucesso extremamente rápido e não tivermos atingido 2 tokens
        if (tokenCount < 2) {
            loadingIndicator.style.display = 'none';
            output.style.display = 'block';
            output.innerHTML = MarkdownViewer.render(fullText);
        }

        // Salvar no IndexedDB ao terminar de gerar com sucesso
        await saveConversation(question, fullText);
        HistoryUI.load(loadConversation, () => clearBtn.click());

    } catch (e) {
        console.error(e);
        loadingIndicator.style.display = 'none';
        output.style.display = 'block';
        output.innerHTML = "Erro: " + e.message;
    } finally {
        btn.disabled = false;
        downloadModal.style.display = 'none';
    }
});

async function verifyAndHandleApiSupport() {
    const status = await AI.checkSupport();
    const unsupportedModal = document.getElementById('unsupportedModal');
    
    permissionModal.style.display = 'none';
    if (unsupportedModal) unsupportedModal.style.display = 'none';

    if (status === 'supported') {
        return true;
    } else if (status === 'unsupported') {
        if (unsupportedModal) unsupportedModal.style.display = 'flex';
        return false;
    } else {
        permissionModal.style.display = 'flex';
        return false;
    }
}

checkPermissionBtn.addEventListener('click', async () => {
    checkPermissionBtn.textContent = "Verificando...";
    const originalStyle = checkPermissionBtn.style.backgroundColor;

    // Delay visual para feedback da UI
    await new Promise(resolve => setTimeout(resolve, 600));

    const supported = await verifyAndHandleApiSupport();

    if (!supported) {
        checkPermissionBtn.style.backgroundColor = "var(--secondary)";
        checkPermissionBtn.textContent = "Ainda não ativado. Reiniciou o Chrome?";
        setTimeout(() => {
            checkPermissionBtn.style.backgroundColor = originalStyle;
            checkPermissionBtn.textContent = "Já ativei / Tentar novamente";
        }, 3000);
    } else {
        checkPermissionBtn.style.backgroundColor = "var(--primary)";
        checkPermissionBtn.textContent = "Ativado com sucesso!";
    }
});

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    await verifyAndHandleApiSupport();
    HistoryUI.load(loadConversation, () => clearBtn.click());
});
