const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const Photo = require("../db/photoModel");
const mongoose = require('mongoose');
const jwtAuth = require("../middleware/jwtAuth");
router.post("/", async (request, response) => {
 
});

router.get('/list', async (req, res) => {
    try {
        const users = await User.find({}, '_id first_name last_name');
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: "Không thể truy xuất người dùng" });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '_id first_name last_name location description occupation login_name');
        if (!user) {
            return res.status(400).send({ error: "Không tìm thấy người dùng" });
        }
        res.send(user);
    } catch (error) {
        res.status(400).send({ error: "ID người dùng không hợp lệ" });
    }
});

router.post("/update", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId; 
      const updateData = req.body;
  
      
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).send({ error: "User not found" });
      }
  
      
      const { password, ...userData } = updatedUser.toObject();
      res.send(userData);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  

module.exports = router;