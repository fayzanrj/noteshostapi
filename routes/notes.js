const express = require('express')
const Notes = require('../models/Notes');
const router = express.Router()
var fetchUser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1 : to fetch all the notes of the user
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })       // fetching using the user id
        res.json(notes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

// Ruote 2 : adding a note to the user's data
router.post('/addnote', fetchUser, [
    body('title', 'Title cannot be empty').exists(),              // validating
    body('title' , "Maximum ").isLength({max:30})
], async (req, res) => {
    try {
        // checking if any error exists in the added data 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // 
        const { title, description, tag } = req.body;

        // making new note 
        const note = await new Notes({
            title, description, tag, user: req.user.id
        })

        // saving the new note in the database
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try {
        // creating a new Note that will contain the updated version of an old note
        const newNote = {}

        // if any exists, it will be added in the (updated)newNote
        if (req.body.title) {
            newNote.title = req.body.title
        }
        if (req.body.description) {
            newNote.description = req.body.description
        }
        if (req.body.tag) {
            newNote.tag = req.body.tag
        }

        // checking if the entered note exists
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Not Found")
        }

        // checking if the person updating has the authority
        if (note.user.toString() != req.user.id) {
            return res.status(401).send("You are not allowed to edit the following note.");
        }

        // updating the updated parts of the note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({Success:'Note has been updated' , note : note});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }

})

// Router 3 : to delete a note
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // checking if the entered note exists
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Not Found")
        }

        // checking if the person updating has the authority
        if (note.user.toString() != req.user.id) {
            return res.status(401).send("You are not allowed to delete the following note.");
        }

        // deleting the note
        note = await Notes.findByIdAndDelete(req.params.id, { new: true })
        res.json({Success:'Note has been deleted' , note : note});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }

})


module.exports = router