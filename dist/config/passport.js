"use strict";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../models/userModel";
// import dotenv from "dotenv";
// dotenv.config();
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails?.[0].value });
//         if (!user) {
//           user = await User.create({
//             username: profile.displayName,
//             email: profile.emails?.[0].value,
//             password: "", // No password needed for Google users
//             profileImage: profile.photos?.[0].value || "",
//           });
//         }
//         return done(null, user);
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );
// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });
