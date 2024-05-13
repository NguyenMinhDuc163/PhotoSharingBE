
const express = require('express');
const router = express.Router();
const Photo = require("../db/photoModel");
const jwtAuth = require('../middleware/jwtAuth'); 

router.post('/:photo_id', jwtAuth, async (req, res) => { 
    const { comment } = req.body;
    const photoId = req.params.photo_id;

    if (!comment) {
        return res.status(400).send({ error: 'Comment cannot be empty' });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).send({ error: 'Photo not found' });
        }

        const newComment = {
            comment: comment,
            user_id: req.userId, 
            date_time: new Date()
        };

        photo.comments.push(newComment);
        await photo.save();

        res.status(201).send(newComment);
    } catch (error) {
        console.error('Server error when adding a comment:', error);
        res.status(500).send({ error: 'Failed to add comment' });
    }
});
router.delete('/photo/:photoId/comment/:commentId', jwtAuth, async (req, res) => {
    try {
        const { photoId, commentId } = req.params;
        const userId = req.userId; 

        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).send({ error: "Photo not found" });
        }

        const comment = photo.comments.id(commentId);
        if (!comment) {
            return res.status(404).send({ error: "Comment not found" });
        }

        if (comment.user_id.toString() !== userId && photo.user_id.toString() !== userId) {
            return res.status(403).send({ error: "Not authorized to delete this comment" });
        }

        photo.comments.remove(comment);

        await photo.save();
        res.send({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: "Server error" });
    }
});

router.put('/photo/:photoId/comment/:commentId', jwtAuth, async (req, res) => {
    const { photoId, commentId } = req.params;
    const { comment } = req.body; 
    const userId = req.userId; 

    if (!comment) {
        return res.status(400).send({ error: 'Comment cannot be empty' });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).send({ error: "Photo not found" });
        }

        const commentToUpdate = photo.comments.id(commentId);
        if (!commentToUpdate) {
            return res.status(404).send({ error: "Comment not found" });
        }

        if (commentToUpdate.user_id.toString() !== userId) {
            return res.status(403).send({ error: "Not authorized to edit this comment" });
        }

        commentToUpdate.comment = comment;

        await photo.save();
        res.send({ message: "Comment updated successfully", comment: commentToUpdate });
    } catch (error) {
        console.error('Server error when editing a comment:', error);
        res.status(500).send({ error: "Failed to edit comment" });
    }
});

module.exports = router;

module.exports = router;


module.exports = router;
