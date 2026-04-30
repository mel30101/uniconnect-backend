class CreateEvent {
  constructor(eventRepo, eventSubject) {
    this.eventRepo = eventRepo;
    this.eventSubject = eventSubject;
  }

  async execute(eventData) {
    const createdEvent = await this.eventRepo.create(eventData);
    
    // Notificar a los observadores sobre el nuevo evento
    this.eventSubject.notify('NUEVO_EVENTO', createdEvent);
    
    return createdEvent;
  }
}

module.exports = CreateEvent;
