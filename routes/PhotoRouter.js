const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const User = require("../db/userModel");
const multer = require('multer');
const jwtAuth = require("../middleware/jwtAuth");
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')  
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

const upload = multer({ storage: storage });

router.post("/", jwtAuth, upload.single('photo'), async (request, response) => {
  if (!request.file) {
      return response.status(400).send({ error: "Không có file nào được tải lên" });
  }

  try {
      const newPhoto = new Photo({
          title: request.body.title,
          file_name: request.file.filename,
          user_id: request.userId, 
          date_time: new Date()
      });
      await newPhoto.save();
      response.status(201).send(newPhoto);
  } catch (error) {
      response.status(500).send({ error: "Không thể lưu ảnh" });
  }
});
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const photoId = req.params.id;

    
    const photoExists = await Photo.exists({ _id: photoId });
    if (!photoExists) {
      return res.status(400).send({ error: 'Ảnh không tồn tại' });
    }

    
    await Photo.findByIdAndDelete(photoId);

    
    res.send({ message: 'Ảnh đã được xóa thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Đã xảy ra lỗi' });
  }
});



router.get("/", async (req, res) => {
    try {
        const photos = await Photo.find({});
        res.send(photos);
    } catch (error) {
        res.status(500).send({ error: "Không thể truy xuất người dùng" });
    }
});
router.get('/photosOfUser/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(400).send({ error: 'Người dùng không tồn tại' });
      }
  
      
      const photos = await Photo.find({ user_id: userId });
       
  
      
      if (photos.length === 0) {
        return res.status(404).send({ error: 'Không có ảnh nào cho người dùng này' });
      }
  
      
      const formattedPhotos = await Promise.all(
        photos.map(async (photo) => {
          
          const formattedComments = await Promise.all(
            photo.comments.map(async (comment) => {
              
              const user = await User.findById(comment.user_id)
                .select('_id first_name last_name');
  
              return {
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user_id: comment.user_id, 
                user: user ? { _id: user._id, first_name: user.first_name, last_name: user.last_name } : null
              };
            })
          );
  
          return {
            _id: photo._id,
            user_id: photo.user_id,
            file_name: photo.file_name,
            date_time: photo.date_time,
            comments: formattedComments,
            title: photo.title
          };
        })
      );
  
      
      res.send(formattedPhotos);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Đã xảy ra lỗi' });
    }
  });
  router.put('/editPhoto/:id', jwtAuth, async (req, res) => {
    try {
      const photoId = req.params.id;
      const newTitle = req.body.title;
  
      // Check if the photo exists
      const photoExists = await Photo.exists({ _id: photoId });
      if (!photoExists) {
        return res.status(400).send({ error: 'Ảnh không tồn tại' });
      }
  
      // Update the title of the photo
      const updatedPhoto = await Photo.findByIdAndUpdate(photoId, { title: newTitle }, { new: true });
  
      // Send the updated photo
      res.send(updatedPhoto);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Đã xảy ra lỗi' });
    }
  });

module.exports = router;
