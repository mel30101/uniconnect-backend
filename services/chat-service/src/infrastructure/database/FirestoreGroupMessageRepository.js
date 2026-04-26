const admin = require('firebase-admin');

class FirestoreGroupMessageRepository {
  constructor(db) {
    this.db = db;
  }

  async create(groupId, messageData) {
    const docRef = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .add({
        ...messageData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    // Opcional: Actualizar el último mensaje en el group_members o en el group
    // dependiento cómo el front muestre los chats de grupo
    return docRef.id;
  }
}

module.exports = FirestoreGroupMessageRepository;
