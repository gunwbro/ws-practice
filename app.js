const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();

const webSocket = require("./socket");
const indexRouter = require("./routes");
const connect = require("./schemas");

const app = express();
connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 8005);

app.use(morgan("dev")); // 요청에 대한 정보 콘솔에 기록해줌
app.use(express.static(path.join(__dirname, "public"))); // 정적 파일 제공
app.use(express.json()); // 요청의 본문을 해석해줌
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 요청에 동봉된 쿠키를 해석해줌. 해석된 쿠키는 req.cookies 객체에 들어감
app.use(
  // 세션 관리
  session({
    resave: false, // 요청이 왔을 때 세션에 수정사항이 생기지 않더라도 세션을 다시 저장할지에 대한 설정
    saveUninitialized: false, //  세션에 저장할 내역이 없더라도 세션을 저장할지에 대한 설정 (방문자 추적할 때 용이)
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // 클라이언트에서 쿠키 확인 불가능
      secure: false, // https 아닌 환경에서도 사용가능
    },
  })
);
app.use(flash());

app.use("/", indexRouter); // 일회성 메시지 웹 브라우저에 나타낼 때 사용

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message; // pug에 locals 변수 전달
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

webSocket(server);
