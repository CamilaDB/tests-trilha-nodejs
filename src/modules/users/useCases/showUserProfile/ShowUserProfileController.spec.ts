import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Shou User Profile Controller", () => {

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
  });

  it("should be able to show user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(responseToken.body.user.email);
  });

  it("should not be able to show profile with invalid token", async () => {
    const token = sign("user", "secret");

    const response = await request(app).post("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(401);
  });
})