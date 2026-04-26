class GetEvents {
  constructor(eventRepo, categoryRepo) {
    this.eventRepo = eventRepo;
    this.categoryRepo = categoryRepo;
  }

  async execute({ categoryId } = {}) {
    let events = await this.eventRepo.findAll();
    const categories = await this.categoryRepo.findAll();
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // 1. Filtrar por categoría (usando el ID original antes de mapear)
    if (categoryId) {
      events = events.filter(event => event.type === categoryId);
    }

    // 2. Mapear 'type' al Nombre de la categoría (sin añadir nuevos campos)
    // El usuario pide que el frontend vea el nombre basándose en el type que tiene el id.
    // Al sobreescribir el campo 'type' con el nombre antes de enviar el JSON, 
    // la tarjeta del frontend mostrará directamente el nombre (ej: "Cultural").
    const mappedEvents = events.map(event => ({
      ...event,
      type: categoryMap[event.type] || 'General'
    }));

    // 3. Organizar por categoría (Orden alfabético del nombre)
    return mappedEvents.sort((a, b) => a.type.localeCompare(b.type));
  }
}

module.exports = GetEvents;
