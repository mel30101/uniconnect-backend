/**
 * @interface ITokenRepository
 */
class ITokenRepository {
  async getTokensByUserId(userId) {
    throw new Error('Method not implemented');
  }

  async saveToken(userId, token) {
    throw new Error('Method not implemented');
  }

  async removeToken(token) {
    throw new Error('Method not implemented');
  }
}

module.exports = ITokenRepository;
