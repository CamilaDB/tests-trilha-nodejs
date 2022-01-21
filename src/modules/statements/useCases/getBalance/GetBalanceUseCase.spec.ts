import { v4 } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let statmentRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Get balance", () => {

  beforeEach(() => {
    statmentRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(statmentRepositoryInMemory, usersRepositoryInMemory);
  });

  it("should be able to get balance of a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Statment",
      email: "userStatment@mail.com",
      password: "123456",
    });
    const balance = await getBalanceUseCase.execute({ user_id: user.id! });
 
    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get balance of a non existing user ", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: v4() })
    }).rejects.toBeInstanceOf(AppError);
  });

})