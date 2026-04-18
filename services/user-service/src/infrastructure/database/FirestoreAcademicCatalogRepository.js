class FirestoreAcademicCatalogRepository {
  constructor(db) {
    this.db = db;
  }

  async getAllFaculties() {
    const snapshot = await this.db.collection('faculties').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllCareers() {
    const snapshot = await this.db.collection('careers').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllSubjects() {
    const snapshot = await this.db.collection('subjects').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getSubjectById(id) {
    const doc = await this.db.collection('subjects').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getSubjectsByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('subjects').doc(id).get())
    );
    return docs.map(doc => ({
      id: doc.id,
      exists: doc.exists,
      ...(doc.exists ? doc.data() : {})
    }));
  }

  async getSectionsByCareerId(careerId) {
    const snapshot = await this.db.collection('sections')
      .where('careerId', '==', careerId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getMappingsByFilter(filter) {
    let query = this.db.collection('academic_mappings');
    if (filter.facultyId) {
      query = query.where('facultyId', '==', filter.facultyId);
    }
    if (filter.academicLevelId) {
      query = query.where('academicLevelId', '==', filter.academicLevelId);
    }
    if (filter.formationLevelId) {
      query = query.where('formationLevelId', '==', filter.formationLevelId);
    }
    if (filter.careerId) {
      query = query.where('careerId', '==', filter.careerId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getMappingById(id) {
    const doc = await this.db.collection('academic_mappings').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getAcademicLevelById(id) {
    if (!id) return null;
    const doc = await this.db.collection('academic_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getFormationLevelById(id) {
    if (!id) return null;
    const doc = await this.db.collection('formation_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getFacultyById(id) {
    if (!id) return null;
    const doc = await this.db.collection('faculties').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getCareerById(id) {
    if (!id) return null;
    const doc = await this.db.collection('careers').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getAcademicLevelsByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('academic_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getFormationLevelsByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('formation_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCareersByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('careers').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = FirestoreAcademicCatalogRepository;
