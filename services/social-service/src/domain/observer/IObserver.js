/**
 * Interfaz para el Observador (Observer).
 */
class IObserver {
  update(event, data) {
    throw new Error("Method 'update()' must be implemented.");
  }
}

module.exports = IObserver;
