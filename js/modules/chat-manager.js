/**
 * ChatManager - Gerencia envio de mensagens e renderização de respostas.
 */
const ChatManager = (() => {
    const output = document.getElementById('output');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput');

    function renderMediaInOutput(files) {
        if (!files || files.length === 0) return null;
        const container = document.createElement('div');
        container.className = 'output-media-container';
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'output-media-item';
            const url = URL.createObjectURL(file);
            if (file.type.startsWith('image/')) {
                item.classList.add('image-item');
                const img = document.createElement('img');
                img.src = url;
                img.onclick = () => ModalManager.showImage(url);
                item.appendChild(img);
            } else {
                item.classList.add('audio-item');
                item.innerHTML = `<span>🎵</span><audio controls src="${url}"></audio>`;
            }
            container.appendChild(item);
        });
        return container;
    }

    async function sendPrompt(onSuccess) {
        const question = promptInput.value.trim();
        const selectedFiles = MediaManager.getSelectedFiles();
        
        if (!question && selectedFiles.length === 0) {
            promptInput.focus();
            return;
        }

        const currentMediaFiles = [...selectedFiles];
        generateBtn.disabled = true;
        output.style.display = 'none';
        loadingIndicator.style.display = 'flex';

        try {
            const content = [];
            if (question) content.push({ type: 'text', value: question });
            selectedFiles.forEach(file => {
                content.push({ type: file.type.startsWith('image/') ? 'image' : 'audio', value: file });
            });

            let mediaContainerCreated = false;
            let textDiv = null;

            const fullText = await AI.generateResponse(content, (text) => {
                // Só escondemos o spinner quando realmente temos algo para mostrar (texto ou mídia)
                if (text.length > 0 || currentMediaFiles.length > 0) {
                    loadingIndicator.style.display = 'none';
                    output.style.display = 'block';
                }

                if (!mediaContainerCreated) {
                    output.innerHTML = '';
                    const mediaContainer = renderMediaInOutput(currentMediaFiles);
                    if (mediaContainer) {
                        output.appendChild(mediaContainer);
                        // Se temos mídia, já garantimos que o output está visível e o spinner oculto
                        output.style.display = 'block';
                        loadingIndicator.style.display = 'none';
                    }
                    textDiv = document.createElement('div');
                    output.appendChild(textDiv);
                    mediaContainerCreated = true;
                }
                
                if (text.length > 0) {
                    textDiv.innerHTML = MarkdownViewer.render(text);
                }
            });

            await saveConversation(question || "[Multimodal]", fullText, currentMediaFiles);
            if (onSuccess) onSuccess();
        } catch (e) {
            console.error(e);
            loadingIndicator.style.display = 'none';
            output.style.display = 'block';
            output.innerHTML = "Erro: " + e.message;
        } finally {
            generateBtn.disabled = false;
        }
    }

    function displayConversation(item) {
        promptInput.value = item.question;
        output.style.display = 'block';
        output.innerHTML = '';
        const mediaContainer = renderMediaInOutput(item.mediaFiles || []);
        if (mediaContainer) output.appendChild(mediaContainer);
        const textDiv = document.createElement('div');
        textDiv.innerHTML = MarkdownViewer.render(item.answer);
        output.appendChild(textDiv);
    }

    return { sendPrompt, displayConversation };
})();
