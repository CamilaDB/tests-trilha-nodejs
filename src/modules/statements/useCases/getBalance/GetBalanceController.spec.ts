import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Get Balance Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = v4();
    const password = await hash("password", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at) 
        values('${id}', 'name', 'email@email.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const deposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 50,
      description: "description"
    }).set({
      Authorization: `Bearer ${token}`
    });
    
    const withdraw = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 20,
      description: "description"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.statement[0].id).toStrictEqual(deposit.body.id);
    expect(response.body.statement[1].id).toStrictEqual(withdraw.body.id);
    expect(response.body.balance).toBe(deposit.body.amount - withdraw.body.amount);
  });

  it("should not be able get balance with invalid token", async () => {
    const token = sign("user", "secret");

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(401);
  });

})