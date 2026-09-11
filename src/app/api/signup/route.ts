import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerification } from "@/helpers/sendVerification";
import { NextRequest, NextResponse } from "next/server";
import { signUpValidation, usernameValidation } from "@/schemasValidation/signUpSchema";
import { getZodErrorMessage } from "@/helpers/zodErrors";


export async function POST(request: NextRequest) {

    await dbConnect()

    try {

        const reqBody = await request.json()
        const validateInfo = signUpValidation.safeParse(reqBody)

        if (!validateInfo.success) {
            return NextResponse.json({
                success: false,
                error: getZodErrorMessage(validateInfo.error)
            }, { status: 400 });
        }

        const { username, email, password } = validateInfo.data;

        const VerifiedExistingUser = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (VerifiedExistingUser) {
            return NextResponse.json({
                success: false,
                message: 'User already exists'
            },
                { status: 400 })
        }

        const user = await UserModel.findOne({ email })
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);


        if (user) {

            if (user.isVerified) {
                return NextResponse.json({
                    success: false,
                    message: 'User already registered !'
                }, { status: 400 })
            }
            else {
                user.username = username;
                user.password = hashPassword;
                user.isVerified = false
                user.verifyCode = verifyCode;
                user.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await user.save()
            }

        }
        else {

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                isVerified: false,
                isAcceptingMessages: true,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                messages: [],
            })

            await newUser.save()
        }
        // email verification send
        const emailResponse = await sendVerification( email,username, verifyCode)

        if (!emailResponse.success) {
            return NextResponse.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'User Registered Successfully ! Please verifiy email. '
        }, { status: 201 })


    } catch (error) {
        console.error('Error registering user', error)
        return NextResponse.json({
            success: false,
            message: 'Error registering user'
        },
            {
                status: 500
            }
        )
    }
}