const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');
const User = require('../../model/schema/user')

const index = async (req, res) => {
    query = req.query;
    query.deleted = false;
    const user = await User.findById(req.user.userId)
    if (user?.role !== "superAdmin") {
        delete query.createBy
        query.$or = [{ createBy: new mongoose.Types.ObjectId(req.user.userId) }, { assignUser: new mongoose.Types.ObjectId(req.user.userId) }];
    }
    try {
        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                }
            },
            {
                $project: {
                    agenda: 1,
                    dateTime: 1,
                    timestamp: 1,
                    createdByName: 1,
                    action: { $literal: "View/Edit/Delete" }
                }
            }
        ]);
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

const add = async (req, res) => {
    try {
        const result = new MeetingHistory(req.body);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create :', err);
        res.status(400).json({ err, error: 'Failed to create' });
    }
}

const view = async (req, res) => {
    try {
        let response = await MeetingHistory.findOne({ _id: req.params.id });
        if (!response) return res.status(404).json({ message: "no Data Found." });
        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                }
            },
            {
                $project: {
                    agenda: 1,
                    dateTime: 1,
                    timestamp: 1,
                    createdByName: 1,
                    attendes: 1,
                    location: 1,
                    notes: 1,
                    action: { $literal: "View/Edit/Delete" }
                }
            }
        ]);
        res.status(200).json(result[0]);
    } catch (err) {
        console.log("Error:", err);
        res.status(400).json({ Error: err });
    }
}

const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findByIdAndUpdate(req.params.id, {
            deleted: true,
        });
        res.status(200).json({ message: "done", result });
    } catch (err) {
        res.status(404).json({ message: "error", err });
    }
}

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: "done", result })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

module.exports = { add, index, view, deleteData, deleteMany }