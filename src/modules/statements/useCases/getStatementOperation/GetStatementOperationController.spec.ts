import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Get Statement Operation Controller", () => {

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

  it("should be able get statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const deposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 50.00,
      description: "description"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${deposit.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    response.body.amount = parseInt(response.body.amount);

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(deposit.body);
  });

  
  it("should not be able get statement operation with invalid token", async () => {
    const token = sign("user", "secret");

    const deposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 50.00,
      description: "description"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${deposit.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(401);
  });

  it("should not be able get statement operation of a non existing statment", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const response = await request(app).get(`/api/v1/statements/${v4()}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });

})