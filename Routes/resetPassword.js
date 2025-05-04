const express = require('express');
const router = express.Router();

router.get("/resetPassword", (req,res)=>{
    res.render('resetPassword')
});
module.exports = router;

