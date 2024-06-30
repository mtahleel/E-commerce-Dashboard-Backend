import "dotenv/config.js";
import express from "express";
import cors from "cors";
import JWT from "jsonwebtoken";
// import session from "express-session";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

import("./db/config.js");
import User from "./db/User.js";
// import GoogleUser from "./db/googleUser.js";
import Product from "./db/Product.js";

// const clientId = process.env.CLIENTID;
// const clientSecret = process.env.CLIENTSECRET;
const jwtKey = process.env.JWTKEY;

const port = process.env.PORT || 4000;
const app = express();

// use the client app
// app.use(express.static(path.join(__dirname, "client/dist")));

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client/dist/index.html"));
// });

// Setup Session
// app.use(
//   session({
//     secret: "Everything is coded",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// Setup passport
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: clientId,
//       clientSecret: clientSecret,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("profile", profile);
//       try {
//         let user = await GoogleUser.findOne({ googleId: profile.id });

//         if (!user) {
//           user = new GoogleUser({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email: profile.emails[0].value,
//             image: profile.emails[0].value,
//           });
//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// Initial google oauth login
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "http://localhost:5173/",
//     failureRedirect: "http://localhost:5173/login",
//   })
// );

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    let registeredUser = await User.findOne({ email });
    console.log("registeredUser", registeredUser);
    if (registeredUser) {
      // res.status(400).send({ result: "Email already registered!" });
      // throw new error({ message: "Email already registered!" });
      res.send({ result: "Email already registered!" });
    } else {
      let user = new User(req.body);
      console.log(user);
      let result = await user.save();
      result = result.toObject();
      delete result.password;
      delete result.confirmPassword;

      JWT.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({
            result: "Something went wrong, please try after sometime..",
          });
        }
        res.send({ result, auth: token });
      });
    }
  } catch (error) {
    console.log(error.response);
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  // if (req.body.email && req.body.password) {
  let user = await User.findOne(req.body).select("-password");
  if (user) {
    JWT.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        res.send({
          result: "Something went wrong, please try after sometime..",
        });
      }
      res.send({ user, auth: token });
    });
  } else {
    res.send({ result: "No user found" });
  }
});

app.post("/add-product", verifyToken, async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products", verifyToken, async (req, res) => {
  let products = await Product.find();
  console.log(products);
  if (products) {
    res.send(products);
  } else {
    res.send({ result: "No products found" });
  }
});

app.delete("/product/:id", verifyToken, async (req, res) => {
  // res.send("working..");
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No records found" });
  }
});

app.get("/profile/:id", verifyToken, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    console.log("profile user", user);
    console.log("profile id", user._id);
    if (user) {
      res.send(user);
    } else {
      res.send({ result: "profile error" });
    }
  } catch (error) {
    console.log(error.response);
  }
});

app.put("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    // console.log("middleware called if", token);
    JWT.verify(token, jwtKey, (err, valid) => {
      if (err) {
        console.log("Error", err);
        res.send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    res.send({ result: "Please provide a token!" });
  }
}

app.listen(port, (err) => {
  if (err) {
    console.log("Error in server setup!");
  }
  console.log(`Server is listening on port ${port}`);
});
