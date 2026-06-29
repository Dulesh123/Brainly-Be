import express from "express";
import Signup from "./routes/Signup.js";
import db_connect from "./db/db_connect.js";
import Signin from "./routes/Signin.js";
import Postdata from "./middlewares/VerifyUser.js";
import { OAuth2Client } from "google-auth-library";
import cors from "cors";
import Googlesignup from "./routes/Googlesignup.js";
import Googlesignin from "./routes/Googlesignin.js";
import Forgotpassword from "./routes/Forgotpassword.js";
import Resetpassword from "./routes/Resetpassword.js";
import Addlink from "./routes/Addlink.js";
import VerifyUser from "./middlewares/VerifyUser.js";
import Getalldata from "./routes/Getalldata.js";
import upload from "./middlewares/Multer.js";
import Uploadfile from "./routes/Uploadfile.js";
import Edititem from "./routes/Edititem.js";
import Deleteitem from "./routes/Deleteitem.js";

db_connect();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hi from Server");
});

app.post("/signup", (req, res) => {
  Signup(req, res);
});

app.post("/signin", (req, res) => {
  Signin(req, res);
});

app.post("/postdata", (req, res) => {
  Postdata(req, res);
});

app.post("/google-signup", async (req, res) => {
  Googlesignup(req,res);
 
});

app.post("/google-signin", async (req, res) => {
  Googlesignin(req,res);
 
});

app.post("/forgot-password", async (req, res) => {
  Forgotpassword(req,res);
 
});

app.post("/reset-password", async (req, res) => {
  Resetpassword(req,res);
 
});

app.post("/add-link",VerifyUser, async (req, res) => {
 Addlink(req,res);
 
});

app.post("/add-file",VerifyUser,upload.single("file"), async (req, res) => {
 Uploadfile(req,res);
 
});

app.get("/getdata",VerifyUser, async (req, res) => {
 Getalldata(req,res);
 
});

app.put("/update",VerifyUser, async (req, res) => {
 Edititem(req,res);
 
});

app.delete("/delete",VerifyUser, async (req, res) => {
 Deleteitem(req,res);
 
});

app.listen(3000, () => {
  console.log("Server is running at port : 3000");
});
