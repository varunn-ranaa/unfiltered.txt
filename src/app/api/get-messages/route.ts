import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";


export async function GET(request: NextRequest) {

    try {
        await dbConnect()
        const session = await auth()
        const user = session?.user

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(user?._id)

        const searchParams = request.nextUrl.searchParams
        const page = Math.max(1 , parseInt(searchParams.get('page') ||'1')) || 1


        //Aggregation Pipeline

        const aggregatedUser = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $skip : (page - 1) * 10 },
            {$limit : 10},
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!aggregatedUser || aggregatedUser.length === 0) {
            return NextResponse.json({
                success: true,
                message: []
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            message: aggregatedUser[0].messages
        }, { status: 200 });


    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}