import mongoose from "mongoose";
import { Express, response } from "express";
import {initApp} from "../app";
import request from "supertest";
import Post, {IPost} from "../models/postModel";
import User from "../models/userModel";

var app1: Express;

const testUser = {
    userFullName: "post tester",
    email: "post@test.com",
    password: "password123",
    confirmPassword: "password123",
    country: "Israel",
    dateOfBirth: "2000-01-01",
  };

  const authUrl = "/api/auth"; 



beforeAll(async () => {
    console.log("beforeAll - Post Tests");
    const { app, server } = await initApp();
    app1 = app;
    
    // מחיקת נתוני בדיקה קודמים
    await Post.deleteMany({});
    await User.deleteMany({ email: testUser.email });
    
    // יצירת משתמש בדיקה והתחברות
    const registerResponse = await request(app1).post(authUrl + "/register").send(testUser);
    const loginResponse = await request(app1).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password
    });

    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });
  
  afterAll(async () => {
    console.log("afterAll - Post Tests");
    await Post.deleteMany({});
    await User.deleteMany({ email: testUser.email });
    await mongoose.disconnect();
  });

  
let accessToken: string;
let userId: string;


const baseUrl = "/api/posts"; // התאם לנתיב ה-API שלך


// פוסט בדיקה
const testPost = {
    content: "This is a test post.",
    image: "https://example.com/test-image.jpg"
  };
  


describe("Post Tests", () => {
  // משתנה שישמור את מזהה הפוסט שנוצר
  let postId: string;
  
  // בדיקת יצירת פוסט - מקרה חיובי
  test("Create post - successful", async () => {
    const response = await request(app1)
      .post(baseUrl)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(testPost);
  
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("content", testPost.content);
    expect(response.body.owner).toBeDefined();
  
    postId = response.body._id;
  });
  
  
  // בדיקת יצירת פוסט - ללא תוכן
  test("Create post - no content", async () => {
    const response = await request(app1)
      .post(baseUrl)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});
    
    expect(response.statusCode).toBe(500);
  });
  
  // בדיקת יצירת פוסט - ללא אימות
  test("Create post - no authentication", async () => {
    const response = await request(app1)
      .post(baseUrl)
      .send(testPost);
    
    expect(response.statusCode).toBe(401);
  });
  
  // בדיקת יצירת פוסט - טוקן לא תקף
  test("Create post - invalid token", async () => {
    const response = await request(app1)
      .post(baseUrl)
      .set("Authorization", "Bearer invalid_token")
      .send(testPost);
    
    expect(response.statusCode).toBe(401);
  });
  
  // בדיקת קבלת פוסט לפי מזהה
  test("Get post by ID", async () => {
    const response = await request(app1)
      .get(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", postId);
  });
  
  // בדיקת קבלת פוסט לא קיים
  test("Get non-existent post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app1)
      .get(`${baseUrl}/${fakeId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    
    expect(response.statusCode).toBe(404);
  });
  
  // בדיקת עדכון פוסט
  test("Update post - successful", async () => {
    const updatedContent = "This is an updated content.";
    const response = await request(app1)
      .put(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ text: updatedContent });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", postId);
    
    // בדיקה שהעדכון נשמר במסד הנתונים
    const getResponse = await request(app1)
      .get(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    
  });
  
  // בדיקת עדכון פוסט - ללא הרשאה
  test("Update post - unauthorized", async () => {
    // יצירת משתמש אחר
    const otherUser = {
      name: "other user",
      email: "other@test.com",
      password: "password123",
      confirmPassword: "password123",
      country: "Israel",
      dateOfBirth: "2000-01-01"
    };
    
    await request(app1).post("/auth/register").send(otherUser);
    const otherLoginResponse = await request(app1).post("/auth/login").send({
      email: otherUser.email,
      password: otherUser.password
    });
    
    const otherAccessToken = otherLoginResponse.body.accessToken;
    
    // ניסיון לעדכן פוסט של משתמש אחר
    const response = await request(app1)
      .put(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({content: "Unauthurized update try."});
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message");
    
    // ניקוי - מחיקת המשתמש הנוסף
    await User.deleteMany({ email: otherUser.email });
  });
    
  // בדיקת מחיקת פוסט - ללא הרשאה
  test("Delete post - unauthorized", async () => {
    // יצירת משתמש אחר
    const otherUser = {
      name: "other user",
      email: "other@test.com",
      password: "password123"
    };
    
    await request(app1).post("/auth/register").send(otherUser);
    const otherLoginResponse = await request(app1).post("/auth/login").send({
      email: otherUser.email,
      password: otherUser.password
    });
    
    const otherAccessToken = otherLoginResponse.body.accessToken;
    
    // ניסיון למחוק פוסט של משתמש אחר
    const response = await request(app1)
      .delete(`${baseUrl}/${postId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message");
    
    // ניקוי - מחיקת המשתמש הנוסף
    await User.deleteMany({ email: otherUser.email });
  });
  
  
 });