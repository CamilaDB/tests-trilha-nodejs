import { v4 } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let createStatmentUseCase: CreateStatementUseCase;
let statmentRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create statement", () => {

  beforeEach(() => {
    statmentRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatmentUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statmentRepositoryInMemory);
  });

  it("should be able to crate a new statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Statment",
      email: "userStatment@mail.com",
      password: "123456",
    });
    
    const statment = await createStatmentUseCase.execute({ 
      user_id: user.id!, 
      type: OperationType.DEPOSIT, 
      amount: 10, 
      description: "description" 
    });

    expect(statment).toBeTruthy();
  });

  it("should not be able to crate a new statement for a non existing user ", async () => {
    expect(async () => { 
      await createStatmentUseCase.execute({ 
        user_id: v4(), 
        type: OperationType.DEPOSIT, 
        amount: 10, 
        description: "description" 
      }); 
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to crate a new statement if user does not have valid balance", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Statment Error",
      email: "userStatmentError@mail.com",
      password: "123456",
    });

    const statement = await statmentRepositoryInMemory.create({ 
      user_id: user.id!, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "description" 
    });

    expect(async () => { 
      await createStatmentUseCase.execute({ user_id: user.id!, type: OperationType.WITHDRAW, amount: 1000, description: "description" }) 
    }).rejects.toBeInstanceOf(AppError);
  });


})