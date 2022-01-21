import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';

let connection: Connection;

describe("Create User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "name",
      email: 'email@email.com',
      password: "password"
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create new user when email is already taken", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "name",
      email: 'email@email.com',
      password: "password"
    });
    expect(response.status).toBe(400);
  });
})