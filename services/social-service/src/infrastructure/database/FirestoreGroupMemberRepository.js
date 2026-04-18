class FirestoreGroupMemberRepository  {
  constructor(db) {
    this.db = db;
  }

  async findByGroupId(groupId) {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByUserId(userId, role) {
    let query = this.db.collection('group_members').where('userId', '==', userId);
    if (role) {
      query = query.where('role', '==', role);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByGroupAndUser(groupId, userId) {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ref: doc.ref, ...doc.data() };
  }

  async add(memberData) {
    await this.db.collection('group_members').add({
      groupId: memberData.groupId,
      userId: memberData.userId,
      role: memberData.role || 'student',
      joinedAt: memberData.joinedAt || new Date()
    });
  }

  async remove(groupId, userId) {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return false;
    await snapshot.docs[0].ref.delete();
    return true;
  }

  async updateRole(groupId, userId, newRole) {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return false;
    await snapshot.docs[0].ref.update({ role: newRole });
    return true;
  }

  // Método especial para la transacción de transferencia de admin
  async getRefsByGroupAndUser(groupId, userId) {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .get();
    if (snapshot.empty) return null;
    return {
      ref: snapshot.docs[0].ref,
      data: snapshot.docs[0].data()
    };
  }
}

module.exports = FirestoreGroupMemberRepository;
