const { asyncHandler } = require('../middlewares/errorMiddleware');

class SearchController {
  constructor(useCases) {
    this.searchStudentsUC = useCases.searchStudents;
  }

  searchStudents = asyncHandler(async (req, res) => {
    const { name, subjectId, excludeId } = req.query;
    const results = await this.searchStudentsUC.execute({ name, subjectId, excludeId });
    res.json(results);
  });
}

module.exports = SearchController;
