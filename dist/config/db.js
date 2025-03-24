"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoose_1.default.set('strictQuery', true);
    try {
        const uri = process.env.NODE_ENV === "test"
            ? process.env.MONGO_URI_TEST
            : process.env.MONGO_URI;
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected to ${process.env.NODE_ENV === "test" ? "Test DB" : "Cloud DB"}`);
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        if (process.env.NODE_ENV !== "test") {
            process.exit(1); // Prevent Jest from crashing during tests
        }
    }
});
exports.connectDB = connectDB;
exports.default = exports.connectDB;
