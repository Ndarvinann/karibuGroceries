const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/KGL');
    console.log('✅ MongoDB connected successfully!');
    
    const result = await mongoose.connection.db.admin().ping();
    console.log('Ping result:', result);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

testConnection();


// router.post("/addCashPayment", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
//   const user = req.user;
//   if (user.role !== "Manager" && user.role !== "SalesAgent") {
//       return res.status(403).send("Access denied: You are not allowed to access this page.");
//   }