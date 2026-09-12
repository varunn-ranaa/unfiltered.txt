import mongoose, { Schema, Document, model } from "mongoose";

export interface Message extends Document {
    context: string;
    createdAt: Date;
}

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    verifyCode: string;
    verifyCodeExpiry: Date;
    resetVerifyCode: string;
    resetVerifyCodeExpiry: Date;
    messages: Message[]
}

const MessageSchema: Schema<Message> = new Schema({
    context: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    verifyCode: {
        type: String,
        required: [true, 'Verify Code is required'],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, 'Verify Code Expiry is required'],
    },
    resetVerifyCode: {
        type: String,
        required: [false, 'Reset Code is required'],
    },
    resetVerifyCodeExpiry: {
        type: Date,
        required: [false, 'Reset Code Expiry is required'],
    },
    messages: [MessageSchema],
});

const UserModel =  mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User",UserSchema)

export default UserModel