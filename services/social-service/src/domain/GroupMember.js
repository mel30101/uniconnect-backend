class GroupMember {
  constructor({ groupId, userId, role, joinedAt }) {
    this.groupId = groupId;
    this.userId = userId;
    this.role = role || 'student';
    this.joinedAt = joinedAt || new Date();
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = GroupMember;
