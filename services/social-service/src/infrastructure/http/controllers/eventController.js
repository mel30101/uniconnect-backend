const { asyncHandler } = require('../middlewares/errorMiddleware');

class EventController {
  constructor(useCases) {
    this.getEventsUC = useCases.getEvents;
  }

  getEvents = asyncHandler(async (req, res) => {
    const events = await this.getEventsUC.execute();
    res.status(200).json(events);
  });
}

module.exports = EventController;
