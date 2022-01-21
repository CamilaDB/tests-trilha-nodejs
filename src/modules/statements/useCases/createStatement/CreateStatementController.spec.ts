import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Create Statement Controller", () => {

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

  it("should be able to create deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 10,
      description: "deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(10);
    expect(response.body.description).toBe("deposit");
  });

  it("should be able to create withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 5,
      description: "withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(5);
    expect(response.body.description).toBe("withdraw");
  });

  it("should not be able to crate a new statement with invalid token", async () => {
    const token = sign("user", "secret");

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "description"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to crate a new statement if user does not have valid balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 900,
      description: "withdraw error"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
  });
})