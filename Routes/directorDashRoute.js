const express = require("express");
const router = express.Router();
const passport = require("passport");

//signup Routes

//import models;
const SignUp = require("../model/signupSchema");

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  try {
    const user = new SignUp(req.body);
    let existingUser = await SignUp.findOne({
      email: req.body.email,
    });
    if (existingUser) {
      return res.status(400).send("Credentials already in use");
    } else {
      await SignUp.register(user, req.body.password, (error) => {
        if (error) {
          throw error;
          return res.status(500).send("Error during registration");
        }
        res.redirect("/login"); //continue and log in
      });
    }
    console.log(user);
  } catch (error) {
    res.status(400).render("signup"); //take the form back to signup
  }
});

///Login routes
router.get("/login", (req, res) => {
  res.render("login");
});

router.post( "/login", passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
  console.log(req.body);
    if (req.user.role === "manager") {
      res.redirect("/managerDash");
    } else if (req.user.role === "salesAgent") {
      res.redirect("/salesDash");
    } else if (req.user.role === "director") {
      res.redirect("/report");
    }
    else{
      res.send('"Role not defined, please contact admin"')
    }
  }
);
router.get('/logout', (req,res)=>{
  if(req.session){
    req.session.destroy((error)=>{
      if(error){
        return res.status(500).send(error ,'Error logging out')
      }
      res.redirect('/login')
    })
  }
})
module.exports = router;
