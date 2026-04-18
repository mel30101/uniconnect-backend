class AcademicProfile {
  constructor({ studentId, mappingId, subjects, updatedAt }) {
    this.studentId = studentId;
    this.mappingId = mappingId || '';
    this.subjects = subjects || [];
    this.updatedAt = updatedAt || new Date();
  }
}

module.exports = AcademicProfile;
