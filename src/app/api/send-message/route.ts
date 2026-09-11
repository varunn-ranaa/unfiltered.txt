import { getZodErrorMessage } from "@/helpers/zodErrors";
import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";
import { messageValidation } from "@/schemasValidation/messageSchema";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const { username, content } = await request.json()

        if (!content || !username) {
            return NextResponse.json(
                { error: "Username and content are required" },
                { status: 400 }
            );
        }

        const res = messageValidation.safeParse({ content })

        if (!res.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: getZodErrorMessage(res.error)
                },
                { status: 400 }
            );
        }

        const text = res.data?.content
        const user = await UserModel.findOne({
            username: username
        })

        if (!user) {
            return NextResponse.json(
                { error: "No such user exists!" },
                { status: 404 }
            );
        }

        if (!user.isAcceptingMessages) {
            return NextResponse.json(
                { success: false, error: "User is not accepting messages at this time." },
                { status: 403 } // 403 Forbidden
            );
        }

        const newMessage = {
            context: text,
            createdAt: new Date()
        }

        user.messages.push(newMessage as Message);
        await user.save()

        return NextResponse.json({
            success: true,
            message: "Message Sent Successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
