const express = require("express")
const fetchuser = require("../middleware/fetchuser")
const router = express.Router()
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator')

// Route 1
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {

        const notes = await Note.find({ user: req.user.id })
        res.json([notes])
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some Error Occured")
    }
})

// Route 2
router.post('/addnotes', fetchuser, [
    body('title', "Enter a valid Title").isLength({ min: 3 }),
    body('description', "Enter a valid Description").isLength({ min: 5 }),
], async (req, res) => {
    try {

        const { title, description, tag } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNotes = await note.save()
        res.json(savedNotes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some Error Occured")
    }
})
// Route 3: Updating the existing note

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const {title,description,tag}=req.body;
    const newNote={}
    if(title){newNote.title=title}
    if(description){newNote.description=description}
    if(tag){newNote.tag=tag}
    let note=await Note.findById(req.params.id)
    if(!note){return req.status(404).send("Not found")}

    if(note.user.toString() !==req.user.id){
        return req.status(401).send("Not Allowed")
    }
    note=await Note.findByIdAndUpdate(req.params.id , {$set:newNote},{new:true})
    res.json({note})
})

// Route 4: Delete note

module.exports = router