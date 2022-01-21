import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });
  
  it("should be able to create new user", async () => {
    const result = await createUserUseCase.execute({
      name: "User Test",
      email: "userTest@mail.com",
      password: "123456",
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create new user when email is already taken", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Error",
        email: "userError@mail.com",
        password: "123456",
      }

      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
})