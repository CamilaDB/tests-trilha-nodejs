import request from "supertest";
import { v4 } from "uuid";
import { app } from "../../../../app";
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate User Controller", () => {

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

  afterAll(async () =>{
    await connection.dropDatabase();
    await connection.close();
  });

  it("should authenticated with valid credentials", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "password"
    })
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: 'email@mail.com',
      password: "password"
    })
    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: 'email@email.com',
      password: "incorrect"
    })
    expect(response.status).toBe(401);
  });
})