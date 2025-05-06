
// const express = require("express");
// const router = express.Router();
// const procurement=require('../model/procurementShema')

// router.get("/addProduce", (req, res) => {
//   res.render("procurement");
// });

// router.post("/addProduce", async(req, res) => {
//   console.log("Request Body:", req.body);
//   try {
//     const { produce, kilos, cost } = req.body;
//     const pricePerKg = cost / kilos; // Calculate price per kg for new entries
//     //check if the produce already exists
//     const markupPercentage = 0.30; // 30% markup
//       const priceToSell = pricePerKg * (1 + markupPercentage);
//     const existingProduce = await procurement.findOne({produce :produce.toLowerCase() });
//     //if it exists 
//     if(existingProduce){
//       //update the stock
//       existingProduce.kilos += parseFloat(kilos);
//       existingProduce.totalCost += parseFloat(cost);
//       existingProduce.priceToSell = parseFloat(priceToSell);
//       await existingProduce.save();
//     } else{
//       //if produce doesnt exist, create a new entry
//       await new procurement({
//         produce: produce.toLowerCase(),
//         kilos:parseFloat(kilos),
//         cost: parseFloat(cost),
//         totalCost: parseFloat(cost),
//         pricePerKg: pricePerKg,
//         priceToSell: priceToSell,
//         dealerName: req.body.dealerName, 
//         branchname: req.body.branchname,
//         contact: req.body.contact,
//         dateAndTime: new Date()
//     }).save();
//   }
//     res.render("procurement");
//     }catch(err){
//     console.error("Error saving Produce", err.message);
//     res.status(400).send("Failed to save produce: " + err.message);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const procurement = require('../model/procurementShema');

// Route to render the procurement page
router.get("/procurement", (req, res) => {
  res.render("procurement");
});

router.post("/procurement", async(req, res) => {
  try {
    const { produce, kilos, cost } = req.body;
    const pricePerKg = cost / kilos;
    const markupPercentage = 0.30;
    const priceToSell = pricePerKg * (1 + markupPercentage);

    // Check if the produce already exists
    const existingProduce = await procurement.findOne({ produce: produce.toLowerCase() });

    if (existingProduce) {
      // Update existing produce
      existingProduce.kilos += parseFloat(kilos);
      existingProduce.totalCost += parseFloat(cost);
      existingProduce.priceToSell = parseFloat(priceToSell);
      await existingProduce.save();
    } else {
      // Create new produce entry
      await new procurement({
        produce: produce.toLowerCase(),
        kilos: parseFloat(kilos),
        cost: parseFloat(cost),
        totalCost: parseFloat(cost),
        pricePerKg: pricePerKg,
        priceToSell: priceToSell,
        dealerName: req.body.dealerName,
        branchname: req.body.branchname,
        contact: req.body.contact,
        dateAndTime: req.body.dateAndTime || new Date()
      }).save();
    }

    res.redirect("/procurement");
  } catch(err) {
    console.error("Error saving Produce:", err.message);
    res.status(400).send("Failed to save produce: " + err.message);
  }
});

module.exports = router;