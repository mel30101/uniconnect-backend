class GetEvents {
  constructor(eventRepo, categoryRepo) {
    this.eventRepo = eventRepo;
    this.categoryRepo = categoryRepo;
  }

  async execute({ categoryId } = {}) {
    // 1. Obtener eventos (filtrados por DB si se provee categoryId) y categorías
    const [events, categories] = await Promise.all([
      this.eventRepo.findAll(categoryId),
      this.categoryRepo.findAll()
    ]);
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // 2. Mapear 'type' al Nombre de la categoría
    const mappedEvents = events.map(event => ({
      ...event,
      type: categoryMap[event.type] || 'General'
    }));

    // 3. Organizar por categoría (Orden alfabético del nombre)
    return mappedEvents.sort((a, b) => a.type.localeCompare(b.type));
  }
}

module.exports = GetEvents;
