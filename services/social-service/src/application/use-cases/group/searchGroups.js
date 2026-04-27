class SearchGroups {
  constructor(groupRepo, groupMemberRepo, catalogRepo, userRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute({ subjectId, search, userSubjectIds, userId }) {
    // Si no hay búsqueda ni filtros, permitimos obtener todos los grupos (útil para carga inicial)

    // Obtener todos los grupos (filtrados por subjectId si se proporcionó)
    let groups = await this.groupRepo.findAll();

    if (subjectId) {
      groups = groups.filter(g => g.subjectId === subjectId);
    }

    if (userSubjectIds) {
      const allowedIds = userSubjectIds.split(',');
      groups = groups.filter(group => allowedIds.includes(group.subjectId));
    }

    if (userId) {
      groups = groups.filter(group => group.creatorId !== userId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const allSubjects = await this.catalogRepo.getAllSubjects();
      const subjectsMap = {};
      allSubjects.forEach(sub => {
        subjectsMap[sub.id] = sub.name;
      });

      groups = groups.filter(group => {
        const searchTerms = searchLower.split(' ').filter(t => t.length > 0);
        const checkMatch = (text) => {
          if (!text) return false;
          const words = text.toLowerCase().split(' ');
          return searchTerms.every(term =>
            words.some(word => word.startsWith(term))
          );
        };
        const groupNameMatches = checkMatch(group.name);
        const subjectName = subjectsMap[group.subjectId] || '';
        const subjectMatches = checkMatch(subjectName);
        return groupNameMatches || subjectMatches;
      });

      groups = groups.map(group => ({
        ...group,
        subjectName: subjectsMap[group.subjectId] || 'Materia desconocida'
      }));
    } else {
      for (let group of groups) {
        const subject = await this.catalogRepo.getSubjectById(group.subjectId);
        group.subjectName = subject ? subject.name : 'Materia desconocida';
      }
    }

    const enrichedGroups = await Promise.all(groups.map(async (group) => {
      let adminName = 'Desconocido';
      if (group.creatorId) {
        const creator = await this.userRepo.findById(group.creatorId);
        if (creator) adminName = creator.name;
      }

      const members = await this.groupMemberRepo.findByGroupId(group.id);
      const memberIds = members.map(m => m.userId);
      const memberUsers = await this.userRepo.findByIds(memberIds);
      const memberNames = memberUsers.map(u => u.exists !== false ? u.name : 'Usuario desconocido');

      return {
        ...group,
        adminName,
        members: memberNames
      };
    }));

    return enrichedGroups;
  }
}

module.exports = SearchGroups;
