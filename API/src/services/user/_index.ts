import { UserProfileService } from "./profile";
import { PasswordService } from "./password";
import { FollowService } from "./follow";
import { UserCreateService } from "./create";

export class UserService {
  constructor(
    private profileService = new UserProfileService(),
    private passwordService = new PasswordService(),
    private followService = new FollowService(),
    private createService = new UserCreateService()
  ) {}

  get create() {
    return this.createService;
  }

  // Delegate to specific services
  get profile() {
    return this.profileService;
  }

  get password() {
    return this.passwordService;
  }

  get follow() {
    return this.followService;
  }
}
