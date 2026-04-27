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
 * Eventos tipados para el Grupo de Estudio.
 */
const GroupEvents = {
  SOLICITUD_INGRESO: 'SOLICITUD_INGRESO',
  MIEMBRO_ACEPTADO: 'MIEMBRO_ACEPTADO',
  MIEMBRO_RECHAZADO: 'MIEMBRO_RECHAZADO',
  TRANSFERENCIA_ADMIN: 'TRANSFERENCIA_ADMIN'
};

module.exports = { ISubject, GroupEvents };
