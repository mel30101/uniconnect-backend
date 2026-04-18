class User {
  constructor({ uid, name, email, lastLogin, biography, showEmail, phone, age, studyPreference }) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.lastLogin = lastLogin;
    this.biography = biography || '';
    this.showEmail = showEmail ?? true;
    this.phone = phone || '';
    this.age = age || '';
    this.studyPreference = studyPreference || '';
  }
}

module.exports = User;
