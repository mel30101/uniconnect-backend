const admin = require('firebase-admin');

class FirestoreAcademicProfileRepository {
  constructor(db) {
    this.db = db;
  }

  async findByStudentId(studentId) {
    const doc = await this.db.collection('academic_profiles').doc(studentId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async save(studentId, profileData) {
    await this.db.collection('academic_profiles').doc(studentId).set(profileData, { merge: true });
  }

  async findBySubjectFilter(subjectIds) {
    let query = this.db.collection('academic_profiles');
    if (subjectIds && subjectIds.length > 0) {
      query = query.where('subjects', 'array-contains-any', subjectIds);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  }
}

module.exports = FirestoreAcademicProfileRepository;
