import VerificationEmail from '@/components/email/VerificationEmailTemplate';
import { transporter } from '@/lib/nodemailer';
import { render } from '@react-email/render';
import { APIresponse } from '@/types/apiResponse'

export async function sendVerification(
    email: string,
    username: string,
    verifyCode: string
): Promise<APIresponse> {
    try {

        const emailHtml = await render(VerificationEmail({ username: username, otp: verifyCode }))

        await transporter.sendMail({
            from: `"Unfiltered.txt" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Unfiltered.txt | Verification Code',
            html: emailHtml,
        })

        return { success: true, message: 'Send verification email successfully !' }

    } catch (emailError) {
        console.error("error sending verification email", emailError)
        return { success: false, message: 'Failed to send verification email' }
    }
}