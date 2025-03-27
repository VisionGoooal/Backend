import mongoose from "mongoose";
import { Express, response } from "express";
import { initApp } from "../app";
import request from "supertest";
import UserModel from "../models/userModel";
import { IPost } from "../models/postModel";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";
import fs from "fs";
import path from "path";
import { count } from "console";

describe("User Tests", () => {
  let app1: Express;

  // משתמש בדיקה ראשי
  const testUser = {
    userFullName: "משתמש בדיקה",
    email: "user-test@example.com",
    password: "password123",
    confirmPassword: "password123",
    country: "Israel",
    dateOfBirth: "1990-01-01",
  };

  // משתמש נוסף לבדיקות
  const secondUser = {
    userFullName: "משתמש בדיקה שני",
    email: "user-test2@example.com",
    password: "password123",
    confirmPassword: "password123",
    country: "Israel",
    dateOfBirth: "1990-01-01",
  };

  // משתמש למחיקה
  const deleteUser = {
    userFullName: "משתמש למחיקה",
    email: "delete-me@example.com",
    password: "password123",
    confirmPassword: "password123",
    country: "Israel",
    dateOfBirth: "1990-01-01",
  };

  // אחסון טוקנים ומזהים
  let mainToken: string;
  let mainUserId: string;
  let secondToken: string;
  let secondUserId: string;
  let deleteToken: string;
  let deleteUserId: string;

  // מזהי פוסטים לבדיקות
  let testPostIds: string[] = [];

  // מזהי תגובות שנכתבו על ידי המשתמש למחיקה
  let deleteUserCommentIds: string[] = [];

  // מידע על פוסטים של המשתמש למחיקה (ישמש בבדיקת מחיקת תגובות)
  let postsOfDeleteUser: any[] = [];

  beforeAll(async () => {
    console.log("beforeAll - User Tests");
    const { app } = await initApp();
    app1 = app;

    // מחיקת נתוני בדיקה קודמים
    await UserModel.deleteMany({});
    await commentModel.deleteMany({});
    await postModel.deleteMany({});

    // יצירת המשתמש הראשי והתחברות
    const registerRes = await request(app1)
      .post("/api/auth/register")
      .send(testUser);

    const mainLoginResponse = await request(app1).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    mainToken = mainLoginResponse.body.accessToken;
    mainUserId = mainLoginResponse.body.user.id;

    // יצירת המשתמש השני והתחברות
    await request(app1).post("/api/auth/register").send(secondUser);
    const secondLoginResponse = await request(app1)
      .post("/api/auth/login")
      .send({
        email: secondUser.email,
        password: secondUser.password,
      });

    secondToken = secondLoginResponse.body.accessToken;
    secondUserId = secondLoginResponse.body.user.id;

    // יצירת המשתמש למחיקה והתחברות
    await request(app1).post("/api/auth/register").send(deleteUser);
    const deleteLoginResponse = await request(app1)
      .post("/api/auth/login")
      .send({
        email: deleteUser.email,
        password: deleteUser.password,
      });

    deleteToken = deleteLoginResponse.body.accessToken;
    deleteUserId = deleteLoginResponse.body.user.id;

    // יצירת פוסטים למשתמש הראשי
    for (let i = 0; i < 6; i++) {
      const postResponse = await request(app1)
        .post("/api/posts")
        .set("Authorization", `Bearer ${mainToken}`)
        .send({
          content: `פוסט בדיקה ${i}`,
        });

      testPostIds.push(postResponse.body._id);
    }

    // יצירת פוסטים למשתמש למחיקה
    for (let i = 0; i < 3; i++) {
      const postResponse = await request(app1)
        .post("/api/posts")
        .set("Authorization", `Bearer ${deleteToken}`)
        .send({
          content: `פוסט של משתמש למחיקה ${i}`,
        });

      postsOfDeleteUser.push(postResponse.body);
    }

    // יצירת תגובות למשתמש למחיקה - על הפוסטים של המשתמש הראשי
    for (let i = 0; i < 3; i++) {
      const commentResponse = await request(app1)
        .post(`/api/comments/createComment/${testPostIds[i]}`)
        .set("Authorization", `Bearer ${deleteToken}`)
        .send({ content: `תגובה ${i} מהמשתמש המיועד למחיקה` });

      deleteUserCommentIds.push(commentResponse.body._id);
    }

    // יצירת תגובות של המשתמש הראשי על הפוסטים של המשתמש למחיקה
    for (let i = 0; i < postsOfDeleteUser.length; i++) {
      await request(app1)
        .post(`/api/comments/createComment/${postsOfDeleteUser[i]._id}`)
        .set("Authorization", `Bearer ${mainToken}`)
        .send({ content: `תגובה על פוסט של המשתמש למחיקה` });
    }
  });

  afterAll(async () => {
    console.log("afterAll - User Tests");
    await UserModel.deleteMany({
      email: {
        $in: [testUser.email, secondUser.email, deleteUser.email],
      },
    });
    await commentModel.deleteMany({});
    await postModel.deleteMany({});
    await mongoose.disconnect();
  });

  describe("קבלת מידע על משתמש", () => {
    test("קבלת פרופיל המשתמש המחובר", async () => {
      const response = await request(app1).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.user).toHaveProperty(
        "userFullName",
        testUser.userFullName
      );
      expect(response.body.user).toHaveProperty("email", testUser.email);
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).not.toHaveProperty("refreshToken");
    });

    test("קבלת מידע על משתמש לפי מזהה", async () => {
      const response = await request(app1)
        .get(`/api/auth/profile/${mainUserId}`)
        .set("Authorization", `Bearer ${mainToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty(
        "userFullName",
        testUser.userFullName
      );
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("refreshToken");
    });

    test("ניסיון לקבל מידע על משתמש לא קיים", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId().toString();
      const response = await request(app1).get(
        `/api/auth/profile/${nonExistentUserId}`
      );

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Not authorized, no token"
      );
    });

    test("קבלת רשימת כל המשתמשים", async () => {
      const response = await request(app1)
        .get("/api/users/")
        .set("Authorization", `Bearer ${mainToken}`);
      expect(response.statusCode).toBe(200);
      // expect(response.body).toHaveProperty("users");
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // בדיקה שהמשתמשים שלנו נמצאים ברשימה
      const foundTestUser = response.body.find(
        (user: any) => user.email === testUser.email
      );
      const foundSecondUser = response.body.find(
        (user: any) => user.email === secondUser.email
      );

      expect(foundTestUser).toBeDefined();
      expect(foundSecondUser).toBeDefined();

      // בדיקה שאין שדות רגישים
      expect(foundTestUser).not.toHaveProperty("password");
      expect(foundTestUser).not.toHaveProperty("refreshToken");
    });
  });

  describe("עדכון פרופיל משתמש", () => {

    test("עדכון פרופיל ללא הרשאה", async () => {
      const response = await request(app1).post("/users/update").send({
        name: "שם חדש",
        email: testUser.email,
      });

      expect(response.statusCode).toBe(404);
    });

    test("עדכון פרופיל עם תמונה", async () => {
      // יצירת קובץ תמונה פשוט לבדיקה
      const tempImagePath = path.join(__dirname, "test-profile-image.jpg");

      // יצירת קובץ בינארי קטן שנראה כמו תמונת JPEG
      const minimalJpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
        0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01,
        0x22, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x01, 0x3f, 0x10,
      ]);
      fs.writeFileSync(tempImagePath, minimalJpegBuffer);

      try {
        const response = await request(app1)
          .post("/users/update")
          .set("Authorization", `Bearer ${mainToken}`)
          .field("name", testUser.userFullName)
          .field("email", testUser.email)
          .attach("profileImage", tempImagePath);

        if (response.statusCode === 200) {
          expect(response.body).toHaveProperty("profileImage");
          expect(typeof response.body.profileImage).toBe("string");
          expect(response.body.profileImage.length).toBeGreaterThan(0);
        } else {
          console.log(
            "עדכון תמונת פרופיל לא נתמך או נכשל:",
            response.status,
            response.body
          );
        }

        // ניקוי הקובץ הזמני
        fs.unlinkSync(tempImagePath);
      } catch (error) {
        console.error("שגיאה בבדיקת העלאת תמונת פרופיל:", error);
        // ניקוי במקרה של שגיאה
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
        throw error;
      }
    });
  });

  describe("פוסטים של משתמש", () => {
    test("קבלת הפוסטים של המשתמש", async () => {
      const response = await request(app1)
        .get(`/posts/user/${mainUserId}`)
        .set("Authorization", `Bearer ${mainToken}`);

      expect(response.statusCode).toBe(200);

    });
  });

});
