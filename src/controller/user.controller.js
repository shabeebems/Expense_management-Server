import ledgerSchema from "../models/ledger.model.js"
import transactionSchema from "../models/transaction.model.js"
import userSchema from "../models/user.model.js";
import chatSchema from "../models/chat.model.js";
import messageSchema from "../models/message.model.js";
import { decodeToken } from "../utils/jwt.js"
import mongoose from "mongoose";

const getLedgers = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const userObjectId = new mongoose.Types.ObjectId(decoded._id);
        const { status } = req.query;

        let filter = { 
            members: { $elemMatch: { userId: userObjectId } } 
        };

        if (status && status !== "all") {
            filter.status = status;
        }

        const ledgers = await ledgerSchema.find(filter);

        return res.send(ledgers);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};


const createLedger = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const { _id } = decoded
        
        const user = await userSchema.findOne({ _id })
        const userObjectId = new mongoose.Types.ObjectId(decoded._id);
        const data = {
            name: req.body.newName, userId: _id, 
            members: [{
                userId: userObjectId, username: user.username, isAdmin: true
            }]
        }
        const newLedger = await ledgerSchema.create(data)
        return res.send(newLedger)
    } catch (error) {
        console.log(error.message)
    }
}

const getLedger = async(req, res) => {
    try {
        const ledger = await ledgerSchema.findOne({ _id: req.params.ledgerId })
        return res.send(ledger)
    } catch (error) {
        console.log(error.message)
    }
}

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { ledgerId } = req.params;

        const updatedLedger = await ledgerSchema.findByIdAndUpdate(
            ledgerId,
            { status },
            { new: true, runValidators: true }
        );

        return res.send(updatedLedger);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};


const getTransactions = async(req, res) => {
    try {
        const transactions = await transactionSchema.find({ ledgerId: req.params.ledgerId })
        const incomes = transactions.filter((t) => t.type === "income");
        const expenses = transactions.filter((t) => t.type === "expense");
        return res.send({ incomes, expenses })
    } catch (error) {
        console.log(error.message)
    }
}

const createTransactions = async(req, res) => {
    try {
        const { type, amount } = req.body
        const { ledgerId } = req.params

        await transactionSchema.create({ ledgerId, ...req.body })
        if(type === "income") {
            await ledgerSchema.updateOne({ _id: ledgerId }, { $inc: { totalIncome: amount } })
        } else if(type === "expense") {
            await ledgerSchema.updateOne({ _id: ledgerId }, { $inc: { totalExpense: amount } })
        }
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const transactions = await transactionSchema
      .find({ ledgerId: req.params.ledgerId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).send(transactions);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async(req, res) => {
    try {
        const search = req.query.search || "";
        const users = await userSchema.find(
            { username: { $regex: search, $options: "i" } },
            { username: 1, _id: 0 }
        );
        const usernames = users.map(user => user.username);
        return res.send(usernames)
    } catch (error) {
        console.log(error.message)
    }
}

const addMembers = async(req, res) => {
    try {
        const { ledgerId, username } = req.body;
        const user = await userSchema.findOne({ username })
        if(!user) return res.send(false) 

        const ledger = await ledgerSchema.findByIdAndUpdate(
            ledgerId,
            {
                $push: {
                    members: {
                        username: user.username,
                        userId: user._id, isAdmin: false
                    },
                },
            },
            { new: true }
        );

        const existChat = await chatSchema.findOne({ ledgerId })

        if(existChat) {
            await chatSchema.findByIdAndUpdate(
                existChat._id,
                {
                    $push: {
                        members: {
                            username: user.username,
                            userId: user._id, isAdmin: false
                        },
                    },
                },
                { new: true }
            )
        } else {
            const data = {
                ledgerId, name: ledger.name,
                members: ledger.members
            }
            await chatSchema.create(data)
        }
            
        return res.send(user);
    } catch (error) {
        console.log(error.message)
    }
}

const getChats = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const userObjectId = new mongoose.Types.ObjectId(decoded._id);

        const chats = await chatSchema.find({
            'members.userId': userObjectId
        })
        .populate('latestMessage')
        .sort({ latestMessageAt: -1 });

        // Get latest message details for each chat
        const chatsWithMessages = await Promise.all(
            chats.map(async (chat) => {
                const latestMessage = await messageSchema.findById(chat.latestMessage)
                    .populate('sender', 'username _id');
                
                return {
                    ...chat.toObject(),
                    latestMessageDetails: latestMessage
                };
            })
        );

        return res.send(chatsWithMessages);
    } catch (error) {
        console.log("Error in getChats:", error.message);
        return res.status(500).send({ error: error.message });
    }
};

const getCurrentUser = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const user = await userSchema.findById(decoded._id);
        return res.send(user);
    } catch (error) {
        console.log("Error in getCurrentUser:", error.message);
        return res.status(500).send({ error: error.message });
    }
};

export default {
    getLedgers,
    createLedger,
    getLedger,
    updateStatus,
    getTransactions,
    createTransactions,
    getRecentTransactions,
    getUsers,
    addMembers,
    getChats,
    getCurrentUser
}