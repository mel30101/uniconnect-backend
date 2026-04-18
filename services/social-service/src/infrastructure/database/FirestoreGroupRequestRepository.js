const admin = require('firebase-admin');

class FirestoreGroupRequestRepository {
  constructor(db) {
    this.db = db;
  }

  async findPendingByGroupId(groupId) {
    const snapshot = await this.db.collection('groups').doc(groupId)
      .collection('requests')
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByGroupAndUser(groupId, userId) {
    const doc = await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findByUserAndGroup(groupId, userId) {
    const snapshot = await this.db.collection('group_requests')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async create(requestData) {
    const { groupId, userId, userName } = requestData;

    // Validación de seguridad para evitar el error de "documentPath"
    if (!groupId || !userId) {
      throw new Error('Faltan IDs para crear la solicitud: groupId o userId');
    }

    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .set({
        userId: userId,
        userName: userName,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  async updateStatus(groupId, userId, status) {
    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .update({ status });
  }

  async deleteByUserAndGroup(groupId, userId) {
    // Borramos directamente el documento del usuario dentro de la subcolección del grupo
    const docRef = this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId);

    await docRef.delete();
    return true;
  }
}

module.exports = FirestoreGroupRequestRepository;
