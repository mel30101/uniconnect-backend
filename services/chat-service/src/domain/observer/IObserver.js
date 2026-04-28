/**
 * Interfaz para el Observador (Observer) en el patrón Observer.
 */
class IObserver {
  update(event, data) {
    throw new Error("Method 'update()' must be implemented.");
  }
}

module.exports = IObserver;
