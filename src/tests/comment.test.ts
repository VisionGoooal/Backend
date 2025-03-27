import mongoose from "mongoose";
import { Express } from "express";
import { initApp } from "../app";
import request from "supertest";
import Comment from "../models/commentModel";
import Post from "../models/postModel";
import User from "../models/userModel";

let app1: Express;
let accessToken: string;
let userId: string;
let postId: string;
let commentId: string;

const testUser = {
  userFullName: "Comment Tester",
  email: "comment@test.com",
  password: "password123",
  confirmPassword: "password123",
  country: "Israel",
  dateOfBirth: "1990-01-01"
};

const authUrl = "/api/auth";
const baseUrl = "/api/comments";

beforeAll(async () => {
  const { app } = await initApp();
  app1 = app;

  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({ email: testUser.email });

  await request(app1).post(`${authUrl}/register`).send(testUser);

  const loginRes = await request(app1).post(`${authUrl}/login`).send({
    email: testUser.email,
    password: testUser.password
  });

  accessToken = loginRes.body.accessToken;
  userId = loginRes.body.user.id;

  const postRes = await request(app1)
    .post("/api/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ content: "Post for comments" });

  postId = postRes.body._id;
});

afterAll(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({ email: testUser.email });
  await mongoose.disconnect();
});

describe("Comment Tests", () => {
  test("Create comment - success", async () => {
    const res = await request(app1)
      .post(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "This is a test comment", owner: userId, postId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("content", "This is a test comment");
    expect(res.body).toHaveProperty("owner");
    commentId = res.body._id;
  });

  test("Get comments by postId", async () => {
    const res = await request(app1).get(`${baseUrl}/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("content");
  });

  test("Update comment - success", async () => {
    const res = await request(app1)
      .put(`${baseUrl}/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Updated comment content" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("content", "Updated comment content");
  });

  test("Delete comment - success", async () => {
    const res = await request(app1)
      .delete(`${baseUrl}/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    const deleted = await Comment.findById(commentId);
    expect(deleted).toBeNull();
  });


  test("Update comment - no auth", async () => {
    const newRes = await request(app1)
      .post(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Temp comment", owner: userId, postId });

    const res = await request(app1)
      .put(`${baseUrl}/${newRes.body._id}`)
      .send({ content: "Trying to update" });

    expect(res.statusCode).toBe(401);
  });

  test("Delete comment - no token", async () => {
    const res = await request(app1).delete(`${baseUrl}/${commentId}`);
    expect(res.statusCode).toBe(401);
  });

});
