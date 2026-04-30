class FirestoreGroupRepository {
  constructor(db) {
    this.db = db;
  }

  async findById(groupId) {
    const doc = await this.db.collection('groups').doc(groupId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(groupData) {
    const groupRef = this.db.collection('groups').doc();
    const newGroup = {
      id: groupRef.id,
      name: groupData.name,
      subjectId: groupData.subjectId,
      description: groupData.description || '',
      creatorId: groupData.creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await groupRef.set(newGroup);
    return newGroup;
  }

  async update(groupId, data) {
    const docRef = this.db.collection('groups').doc(groupId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updateData = { ...data, updatedAt: new Date() };
    await docRef.update(updateData);
    return { id: doc.id, ...doc.data(), ...updateData };
  }

  async delete(groupId) {
    const docRef = this.db.collection('groups').doc(groupId);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async findAll() {
    const snapshot = await this.db.collection('groups').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByName(name) {
    const snapshot = await this.db.collection('groups')
      .where('name', '==', name)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async updateCreatorId(groupId, newCreatorId) {
    await this.db.collection('groups').doc(groupId).update({ creatorId: newCreatorId });
  }

  async countBySubjectId(subjectId) {
    const snapshot = await this.db.collection('groups')
      .where('subjectId', '==', subjectId)
      .get();
    return snapshot.size;
  }
}

module.exports = FirestoreGroupRepository;