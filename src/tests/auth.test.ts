import { initApp } from "../app";
import request from "supertest";
import mongoose from "mongoose";
import { Express } from "express";
import userModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";

var app1: Express;

beforeAll(async () => {
  console.log("beforeAll");
  const {app , server} = await initApp();
  app1=app
  await userModel.deleteMany();
//   await postModel.deleteMany();
});
afterAll(async () => {
    console.log("afterAll");
    await mongoose.disconnect();
    // done();
  });


const baseUrl = "/api/auth";

type User = {
  userFullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  dateOfBirth: string;
  accessToken?: string;
  refreshToken?: string;
};


const testUser: User = {
  userFullName: "Test User",
  email: "test@user.com",
  password: "testpassword",
  confirmPassword: "testpassword",
  country: "Israel",
  dateOfBirth: "2000-01-01"
}

describe("Auth Tests", () => {
    test("Auth test register", async () => {
        const response = await request(app1).post(baseUrl + "/register").send(testUser);
        expect(response.statusCode).toBe(201);
    });

// בדיקת רישום עם אימייל שכבר קיים
test("Auth test register - duplicate email", async () => {
  // ניסיון נוסף לרשום את אותו משתמש
  const response = await request(app1).post(baseUrl + "/register").send(testUser);
  
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toBe('User already exists');
});

// בדיקת רישום עם אימייל לא תקין
test("Auth test register - invalid email", async () => {
  const invalidEmailUser = {
    name: "Invalid Email",
    email: "notanemail",
    password: "password123",
    confirmPassword: "password123",
    country: "Israel",
    dateOfBirth: "2000-01-01"
  };
  
  const response = await request(app1).post(baseUrl + "/register").send(invalidEmailUser);
  expect(response.statusCode).not.toBe(201);
});

// בדיקת רישום עם שדות חסרים
test("Auth test register - missing fields", async () => {
  const missingFieldsUser = {
    email: "missing@test.com"
    // חסר שם וסיסמה
  };
  
  const response = await request(app1).post(baseUrl + "/register").send(missingFieldsUser);
  expect(response.statusCode).not.toBe(201);
});




    test("Auth test login", async () => {
    const response = await request(app1).post(baseUrl + "/login").send({email : testUser.email ,password : testUser.password});
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    });
    test("Auth test login - fail", async () => {
    const response = await request(app1).post(baseUrl + "/login").send({email : "email" ,password : testUser.password});
    expect(response.statusCode).toBe(400);
    });

    // בדיקת התחברות עם סיסמה שגויה
test("Auth test login - wrong password", async () => {
  const response = await request(app1).post(baseUrl + "/login").send({
    email: testUser.email,
    password: "wrongpassword123"
  });
  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe('Wrong email or password');
});

// בדיקה שהרפרש טוקן מתעדכן במסד הנתונים
test("Auth test login - refresh token updated", async () => {
  const response = await request(app1).post(baseUrl + "/login").send({
    email: testUser.email,
    password: testUser.password
  });
  
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('refreshToken');
  
  // בדיקה שהרפרש טוקן נשמר במסד הנתונים
  const userId = response.body.user.id;
  const user = await userModel.findById(userId);
  if(user){
  expect(user).not.toBeNull();
  expect(user.refreshToken).toEqual([response.body.refreshToken]);
}});

// בדיקת התחברות ללא שדות נדרשים
test("Auth test login - missing fields", async () => {
  // חסר אימייל
  const responseNoEmail = await request(app1).post(baseUrl + "/login").send({
    password: testUser.password
  });
  expect(responseNoEmail.statusCode).not.toBe(200);
  
  // חסרה סיסמה
  const responseNoPassword = await request(app1).post(baseUrl + "/login").send({
    email: testUser.email
  });
  expect(responseNoPassword.statusCode).not.toBe(200);
});

// בדיקת טיפול בשגיאות שרת
test("Auth test login - server error handling", async () => {
  // שמירת הפונקציה המקורית
  const originalFindOne = userModel.findOne;
  
  // מוק לפונקציה שזורקת שגיאה
  userModel.findOne = jest.fn().mockImplementationOnce(() => {
    throw new Error('Database error');
  });
  
  const response = await request(app1).post(baseUrl + "/login").send({
    email: testUser.email,
    password: testUser.password
  });
  
  // בדיקה שמוחזר קוד שגיאה 500
  expect(response.statusCode).toBe(500);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toBe('Server error');
  
  // החזרת הפונקציה המקורית
  userModel.findOne = originalFindOne;
});

describe("Auth Tests - Logout", () => {
  let accessToken: string;
  let refreshToken: string;
  const logoutUser: User = {
    userFullName: "logout",
    email: "logout@user.com",
    password: "logoutpassword",
    confirmPassword: "logoutpassword",
    country: "Israel",
    dateOfBirth: "2000-01-01"
  };

  // לפני הטסט נרשום ונתחבר עם משתמש בשביל לקבל טוקנים
  beforeAll(async () => {
    const registerResponse = await request(app1).post(baseUrl + "/register").send(logoutUser);
    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app1).post(baseUrl + "/login").send({
      email: logoutUser.email,
      password: logoutUser.password
    });

    expect(loginResponse.statusCode).toBe(200);
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
    logoutUser.accessToken = accessToken;
    logoutUser.refreshToken = refreshToken;
  });

  
  // בדיקת התנתקות ללא טוקן הרשאה
  test("Logout - missing access token", async () => {
    const response = await request(app1)
      .post(baseUrl + "/logout")
      .send();
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Refresh token required");
  });

  // בדיקת התנתקות עם טוקן הרשאה לא תקף
  test("Logout - invalid access token", async () => {
    const response = await request(app1)
      .post(baseUrl + "/logout")
      .set("Authorization", "Bearer invalid_token")
      .send();
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Refresh token required");
  });

  // בדיקת התנתקות עם טוקן פג תוקף
  test("Logout - expired token", async () => {
    // יצירת טוקן פג תוקף
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() }, 
      process.env.JWT_SECRET || "your-secret-key", 
      { expiresIn: "-10s" }
    );
    
    const response = await request(app1)
      .post(baseUrl + "/logout")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send();
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Refresh token required");
  });

  // בדיקת טיפול בשגיאות שרת
  test("Logout - server error handling", async () => {
    const originalFindById = userModel.findById;
    
    // מוק לפונקציה שזורקת שגיאה
    userModel.findById = jest.fn().mockImplementationOnce(() => {
      throw new Error("Database error");
    });
    
    const response = await request(app1)
      .post(baseUrl + "/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Refresh token required");
    
    // החזרת הפונקציה המקורית
    userModel.findById = originalFindById;
  });

 });
});