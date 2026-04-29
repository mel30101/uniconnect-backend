class FirestoreEventRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const snapshot = await this.db.collection('events').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async create(eventData) {
    const docRef = await this.db.collection('events').add(eventData);
    return { id: docRef.id, ...eventData };
  }
}

module.exports = FirestoreEventRepository;
