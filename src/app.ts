import cors from "cors";
import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session); 
const store = new MongoDBStore({
  uri: process.env.MONGO_URL as string,
  collection: "sessions",
});
// Express imiz 4 qismdan iborat !
// 1 - ENTRANCE
const app = express();
app.use(express.static(path.join(__dirname, "public"))); 
app.use("/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(cors({ credentials: true, origin: true })); 
app.use(cookieParser()); 
app.use(morgan(MORGAN_FORMAT)); 

// 2 - SESSIONS
app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 60 * 100, // yashash muddati
    },
    store: store, 
    resave: true, 
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member; // brawser(frontend)da qabul qilishimiz mumkin bo'lgan variablelar ni middleware orqali integratsiyasi
  next();
});

// 3 - VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); 

// 4 - ROUTERS
app.use("/admin", routerAdmin); 
app.use("/", router); 

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});
export default server;
