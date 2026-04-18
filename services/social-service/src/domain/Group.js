class Group {
  constructor({ id, name, subjectId, description, creatorId, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.subjectId = subjectId;
    this.description = description || '';
    this.creatorId = creatorId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  validate() {
    if (!this.name || this.name.length < 3) {
      throw new Error('NAME_TOO_SHORT');
    }
    if (!this.subjectId) {
      throw new Error('MISSING_FIELDS');
    }
    if (!this.creatorId) {
      throw new Error('MISSING_FIELDS');
    }
  }
}

module.exports = Group;
