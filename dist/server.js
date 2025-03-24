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
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
const predictionController_1 = require("./controllers/predictionController");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket/socket"); // ✅ Import modular socket handler
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const port = Number(process.env.PORT) || 80;
app_1.default.then((app) => {
    if (process.env.NODE_ENV === "dev") {
        const server = http_1.default.createServer(app);
        server.listen(port, () => console.log(`🚀 Server running on port ${port} with Socket.io`));
        // const io = new Server(server, { cors: { origin: "*" } });
        (0, socket_1.initializeSocket)(server);
    }
    else {
        const prop = {
            key: fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../client-key.pem')),
            cert: fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../client-cert.pem'))
        };
        const httpsServer = https_1.default.createServer(prop, app);
        httpsServer.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${port} with Socket.io`);
        });
        // const io = new Server(httpsServer, { cors: { origin: "*" } });
        (0, socket_1.initializeSocket)(httpsServer);
    }
    // ✅ Schedule AI Match Predictions (Every Day at 6 AM)
    node_cron_1.default.schedule("0 6 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("🔄 Running daily AI prediction task...");
            yield (0, predictionController_1.createPredictionsAutomatically)();
            console.log("✅ Daily match predictions generated.");
        }
        catch (error) {
            console.error("❌ Error generating predictions:", error);
        }
    }));
    // ✅ Start the Server
});
