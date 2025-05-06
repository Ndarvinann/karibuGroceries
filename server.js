//1. dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const moment = require('moment');
const localStrategy = require("passport-local").Strategy;
const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

require("dotenv").config();

//import models here.(files from your models folder)
const Signup = require("./model/signupSchema");
const procurement = require('./model/procurementShema');
const cashSale = require('./model/cashSaleSchema');
const creditSale = require('./model/creditsaleSchema');
const adjustedStock = require('./model/stockAdjustmentSchema');

//2.instatiations
const app = express();
const PORT = 3005;

//import routes here
const authRoutes = require("./Routes/authRoute");
const procurementRoutes = require("./Routes/procurementRoute");
const managerRoutes = require("./Routes/managerRoute");
const reportRoutes = require("./Routes/directorDashRoute");
const paymentRoutes = require("./Routes/paymentsRoute");
const resetPassword = require("./Routes/resetPassword");
const salesDash = require("./Routes/salesDash");
const directorRoute = require("./Routes/directorDashRoute");
//3.configurations

app.locals.moment = moment;

//connect mongoose
mongoose.connect(process.env.BASE, {});
mongoose.connection
  .on("open", () => {
    console.log("Mongoose is connected");
  })
  .on("error", (err) => {
    console.log(`connection error: ${err.message}`);
  });
// set the view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//4.middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//express session configurations

app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

//passport configurations
passport.use(Signup.createStrategy()); //get the filename from your models folder.
passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

//5.routes
app.use("/", authRoutes);
app.use("/", reportRoutes);
app.use("/", managerRoutes);
app.use("/", procurementRoutes);
app.use("/", paymentRoutes);
app.use('/', salesDash);
app.use("/", resetPassword);
app.use("/", directorRoute );

// Homepage
app.get("/", (req, res) => res.redirect("/login"));

//6. bootstrapping the server
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
