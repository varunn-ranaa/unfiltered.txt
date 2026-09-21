import mongoose, { Schema, Document, model } from "mongoose";

export interface Message extends Document {
    context: string;
    createdAt: Date;
}

export interface Provider {
    provider: string,
    providerId: string
}

export interface User extends Document {
    username: string;
    email: string;
    password?: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    resetVerifyCode?: string;
    resetVerifyCodeExpiry?: Date;
    messages: Message[],
    providers: Provider[]
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

const ProviderSchema: Schema = new Schema({
    provider: {
        type: String,
        enum: ["google", "facebook"],
        required: true,
    },
    providerId: {
        type: String,
        required: true,
    },
}, {_id: false})

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
        required: false,
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
        required: false,
    },
    verifyCodeExpiry: {
        type: Date,
        required: false,
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
    providers: [ProviderSchema]
});

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema)

export default UserModel