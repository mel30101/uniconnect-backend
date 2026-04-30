class FirestoreGroupMemberRepository {
  constructor(db) {
    this.db = db;
  }

  async getGroupMembersWithNames(groupId) {
    // 1. Obtener los miembros del grupo
    const snapshot = await this.db
      .collection('group_members')
      .where('groupId', '==', groupId)
      .get();
      
    if (snapshot.empty) return [];

    const userIds = snapshot.docs.map(doc => doc.data().userId);

    // 2. Dado que Firestore 'in' solo soporta arreglos de max 10 a 30 (limitado),
    // dividimos en chunks de 10 si hay muchos usuarios, o mejor aún usamos fetch 
    // pero aquí confiaremos en un fetch basico o por chunks.
    const users = [];
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const userSnap = await this.db
        .collection('users')
        .where('__name__', 'in', chunk)
        .get();
      
      userSnap.docs.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    return users;
  }

  async isMember(groupId, userId) {
    const snapshot = await this.db
      .collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .get();
      
    return !snapshot.empty;
  }
}

module.exports = FirestoreGroupMemberRepository;
