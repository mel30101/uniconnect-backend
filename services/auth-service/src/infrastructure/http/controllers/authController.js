class AuthController {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
  
  async checkSession(req, res) {
    const user = await this.userRepo.findById(req.user.uid);
    res.json(user);
  }
}