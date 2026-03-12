const output = document.getElementById('output');
const btn = document.getElementById('generateBtn');
const input = document.getElementById('promptInput');
const clearBtn = document.getElementById('clearBtn');
const permissionModal = document.getElementById('permissionModal');
const checkPermissionBtn = document.getElementById('checkPermissionBtn');

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

    output.style.display = 'block';
    output.innerHTML = `
        <div class="loading-container">
            <div class="brutalist-spinner"></div>
            <span>Iniciando IA (pode baixar o modelo se for a primeira vez)</span>
        </div>
    `;

    try {
        const fullText = await AI.generateResponse(question, (text) => {
            output.innerHTML = MarkdownViewer.render(text);
        });

        // Salvar no IndexedDB ao terminar de gerar com sucesso
        await saveConversation(question, fullText);
        HistoryUI.load(loadConversation, () => clearBtn.click());

    } catch (e) {
        console.error(e);
        output.innerHTML = "Erro: " + e.message;
    } finally {
        btn.disabled = false;
    }
});

async function verifyAndHandleApiSupport() {
    const supported = await AI.checkSupport();
    if (supported) {
        permissionModal.style.display = 'none';
        return true;
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
