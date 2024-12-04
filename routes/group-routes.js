const express = require('express');
const Group = require('../models/group-model');
const groupMessageSchema = require('../models/group-msg-model')
const User = require('../models/user-model');
const router = express.Router();

// Create a new group
router.post('/create', async (req, res) => {
    const { name, creatorId } = req.body;

    if (!name || !creatorId) {
        return res.status(400).json({ message: 'Group name and creator ID are required.' });
    }

    try {
        const group = new Group({ name, creator: creatorId, members: [creatorId] });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating group.' });
    }
});
router.post('/group', async (req, res) => {
    try {
        const { name, adminId, memberIds } = req.body;

        if (!name || !memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const group = new Group({
            name,
            admin: adminId,
            members: [adminId, ...memberIds],
        });

        await group.save();
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error('Error creating group:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch groups for a user
router.get('/group/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await GroupMessage.find({ groupId }).populate('sender', 'username').sort('timestamp');
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages.' });
    }
});

router.post('/group/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;
    const { senderId, content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    try {
        const message = new GroupMessage({ groupId, sender: senderId, content });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message.' });
    }
});
router.put('/group/:groupId', async(req,res)=>{
    try{
        const {memberId} = req.body;
        const group = await Group.findById(req.params.groupId);

        if(!group) return res.status(404).json({message: 'Group not found'});
        
        if(!group.members.includes(memberId)){
            group.members.push(memberId);
        }
        await group.save();
        res.json({message: 'Member added'})
    } catch(err){
        res.status(500).json({error: 'Failed to manage group'})
    }
})


module.exports = router;






// Fetch group messages

