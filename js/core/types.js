/**
 * Entidades e Tipos Básicos do Sistema
 */

class Conversation {
    constructor({ id, question, answer, mediaFiles = [], timestamp = Date.now() }) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.mediaFiles = mediaFiles;
        this.timestamp = timestamp;
    }
}

class MediaPart {
    constructor(type, value) {
        this.type = type; // 'text', 'image', 'audio'
        this.value = value; // string ou Blob
    }
}
