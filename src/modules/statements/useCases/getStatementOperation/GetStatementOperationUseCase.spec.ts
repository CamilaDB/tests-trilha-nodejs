import { v4 } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatmentOperationUseCase: GetStatementOperationUseCase;
let statmentRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get balance", () => {

  beforeEach(() => {
    statmentRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatmentOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statmentRepositoryInMemory);
  });

  it("should be able get statement operation of a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Statment",
      email: "userStatment@mail.com",
      password: "123456",
    });
    
    const statement = await statmentRepositoryInMemory.create({ 
      user_id: user.id!, 
      type: OperationType.DEPOSIT, 
      amount: 10, 
      description: "description" 
    });

    const statmentOperation = await getStatmentOperationUseCase.execute({
      user_id: user.id!, 
      statement_id: statement.id!
    });

    expect(statmentOperation).toBeTruthy();
  });

  it("should not be able to get operation stattement of a non existing user", async () => {
    const statement = await statmentRepositoryInMemory.create({ 
      user_id: v4(), 
      type: OperationType.DEPOSIT, 
      amount: 10, 
      description: "description" 
    });

    expect(async () => {
      await getStatmentOperationUseCase.execute({ 
        user_id: v4(), 
        statement_id: statement.id!
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to get operation statement of a non existing statment", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Statment",
      email: "userStatment@mail.com",
      password: "123456",
    });

    expect(async () => {
      await getStatmentOperationUseCase.execute({ 
        user_id: user.id!, 
        statement_id: v4()
      });
    }).rejects.toBeInstanceOf(AppError);
  });

})