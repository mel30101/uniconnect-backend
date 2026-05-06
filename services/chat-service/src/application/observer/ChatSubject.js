const { ISubject } = require('../../domain/observer/ISubject');

class ChatSubject extends ISubject {
  constructor() {
    super();
    this.observers = [];
  }

  attach(observer) {
    const exists = this.observers.includes(observer);
    if (!exists) {
      this.observers.push(observer);
    }
  }

  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(event, data) {
    this.observers.forEach(observer => {
      try {
        observer.update(event, data);
      } catch (error) {
        // Capturamos el error para aislarlo, permitiendo que los otros observers sigan ejecutándose
        console.error(`Error en el observer: ${error.message}`);
      }
    });
  }
}

// Singleton para el servicio de chat
const chatSubject = new ChatSubject();
module.exports = chatSubject;
