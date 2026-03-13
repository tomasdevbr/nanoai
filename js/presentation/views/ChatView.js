/**
 * ChatView - Gerencia a renderização do chat no DOM.
 * Segue o Princípio da Responsabilidade Única (SRP).
 */
class ChatView {
    constructor() {
        this.output = document.getElementById('output');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.generateBtn = document.getElementById('generateBtn');
        this.promptInput = document.getElementById('promptInput');
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
        this.output.innerHTML = ''; // Limpa o anterior para preparar o próximo
        this.output.style.display = 'none';
        this.generateBtn.disabled = true;
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
        this.output.style.display = 'block';
        this.generateBtn.disabled = false;
    }

    clearOutput() {
        this.output.innerHTML = '';
        this.output.style.display = 'none';
    }

    renderResponsePart(text, mediaFiles = []) {
        if (text.length > 0 || mediaFiles.length > 0) {
            this.hideLoading();
        }
        
        // Se ainda não temos o container de texto, renderizamos a estrutura inicial
        // Usamos querySelector para buscar dentro do output, evitando IDs duplicados no DOM global
        let textContent = this.output.querySelector('.text-content');
        
        if (!textContent) {
            const mediaHtml = this._renderMediaHtml(mediaFiles);
            if (mediaHtml) this.output.appendChild(mediaHtml);
            
            textContent = document.createElement('div');
            textContent.className = 'text-content';
            this.output.appendChild(textContent);
        }

        if (text.length > 0) {
            textContent.innerHTML = MarkdownRenderer.render(text);
        }
    }

    _renderMediaHtml(files) {
        if (!files || files.length === 0) return null;
        const container = document.createElement('div');
        container.className = 'output-media-container';
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'output-media-item';
            const url = URL.createObjectURL(file);
            if (file.type.startsWith('image/')) {
                item.classList.add('image-item');
                item.innerHTML = `<img src="${url}" onclick="ModalManager.showImage('${url}')">`;
            } else {
                item.classList.add('audio-item');
                item.innerHTML = `<span>🎵</span><audio controls src="${url}"></audio>`;
            }
            container.appendChild(item);
        });
        return container;
    }

    getInputValue() { return this.promptInput.value.trim(); }
    setInputValue(val) { this.promptInput.value = val; }
    focusInput() { this.promptInput.focus(); }
}
