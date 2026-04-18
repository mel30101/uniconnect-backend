class FirestoreUserRepository {
  constructor(db) {
    this.db = db;
  }

  async findById(userId) {
    const doc = await this.db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findByIds(userIds) {
    if (!userIds || userIds.length === 0) return [];
    const docs = await Promise.all(
      userIds.map(id => this.db.collection('users').doc(id).get())
    );
    return docs.map(doc => ({
      id: doc.id,
      exists: doc.exists,
      ...(doc.exists ? doc.data() : {})
    }));
  }

  async save(userId, userData) {
    await this.db.collection('users').doc(userId).set(userData, { merge: true });
  }

  async findAll() {
    const snapshot = await this.db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByUids(uids) {
    if (!uids || uids.length === 0) return [];
    // Firestore 'in' query limitado a 10 elementos
    const snapshot = await this.db.collection('users')
      .where('uid', 'in', uids.slice(0, 10))
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = FirestoreUserRepository;
