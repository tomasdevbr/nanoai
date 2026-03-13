/**
 * SettingsView - Gerencia a UI das configurações de IA.
 */
class SettingsView {
    constructor() {
        this.tempInput = document.getElementById('tempInput');
        this.tempValue = document.getElementById('tempValue');
        this.topKInput = document.getElementById('topKInput');
        this.systemPromptInput = document.getElementById('systemPromptInput');
        
        this._initEvents();
    }

    _initEvents() {
        this.tempInput.addEventListener('input', () => {
            this.tempValue.textContent = this.tempInput.value;
        });
    }

    onSettingsChange(callback) {
        const events = ['change', 'input'];
        const elements = [this.tempInput, this.topKInput, this.systemPromptInput];
        
        elements.forEach(el => {
            events.forEach(ev => {
                el.addEventListener(ev, () => {
                    callback(this.getSettings());
                });
            });
        });
    }

    getSettings() {
        return {
            temperature: parseFloat(this.tempInput.value),
            topK: parseInt(this.topKInput.value, 10),
            systemPrompt: this.systemPromptInput.value
        };
    }

    setSettings(settings) {
        if (settings.temperature !== undefined) {
            this.tempInput.value = settings.temperature;
            this.tempValue.textContent = settings.temperature;
        }
        if (settings.topK !== undefined) {
            this.topKInput.value = settings.topK;
        }
        if (settings.systemPrompt !== undefined) {
            this.systemPromptInput.value = settings.systemPrompt;
        }
    }
}
