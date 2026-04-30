/**
 * Interfaz para el Sujeto (Subject) en el patrón Observer.
 */
class ISubject {
  attach(observer) {
    throw new Error("Method 'attach()' must be implemented.");
  }
  detach(observer) {
    throw new Error("Method 'detach()' must be implemented.");
  }
  notify(event, data) {
    throw new Error("Method 'notify()' must be implemented.");
  }
}

/**
 * Eventos del Chat.
 */
const ChatEvents = {
  NUEVO_MENSAJE: 'NUEVO_MENSAJE',
  MENSAJE_PRIVADO: 'MENSAJE_PRIVADO'
};

module.exports = { ISubject, ChatEvents };
