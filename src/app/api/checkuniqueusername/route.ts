import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import z, { success } from "zod";
import { usernameValidation } from "@/schemasValidation/signUpSchema";
import { NextRequest, NextResponse } from "next/server";
import { getZodErrorMessage } from "@/helpers/zodErrors";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: NextRequest) {

    await dbConnect()

    try {

        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(queryParam) 

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: getZodErrorMessage(result.error)
            }, {
                status: 404
            })
        }

        const { username } = result.data

        const ExistingUser = await UserModel.findOne({
            username, isVerified: true
        })

        if (ExistingUser) {
            return NextResponse.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 400
            })
        }

        return NextResponse.json({
            success: true,
            message: "Username is available"
        }, {
            status: 200
        })


    } catch (error : any) {
        console.log("Unique username Error : ", error)
        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        })
    }

}