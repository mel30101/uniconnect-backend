class FirestoreCategoryRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const snapshot = await this.db.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findById(id) {
    const doc = await this.db.collection('categories').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = FirestoreCategoryRepository;
