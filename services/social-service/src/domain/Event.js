class Event {
  constructor({ id, title, location, date, time, duration, description, type, imageUrl }) {
    this.id = id;
    this.title = title;
    this.location = location;
    this.date = date;
    this.time = time;
    this.duration = duration;
    this.description = description || '';
    this.type = type;
    this.imageUrl = imageUrl || '';
  }
}

module.exports = Event;
