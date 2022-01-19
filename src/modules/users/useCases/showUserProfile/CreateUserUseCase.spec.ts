import { AppError } from "../../../../shared/errors/AppError";
import { v4 } from "uuid";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";;
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("should be able to show user profile", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Profile",
      email: "userProfile@mail.com",
      password: "123456",
    });

    const findUser = await showUserProfileUseCase.execute(user.id!);

    expect(findUser).toMatchObject(user);
  });

  it("should not be able to show profile of a non existing user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute(v4());
    }).rejects.toBeInstanceOf(AppError);
  });
});