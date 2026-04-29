class FirestoreEventRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll(categoryId = null) {
    let query = this.db.collection('events');
    if (categoryId) {
      query = query.where('type', '==', categoryId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async create(eventData) {
    const docRef = await this.db.collection('events').add(eventData);
    return { id: docRef.id, ...eventData };
  }
}

module.exports = FirestoreEventRepository;
