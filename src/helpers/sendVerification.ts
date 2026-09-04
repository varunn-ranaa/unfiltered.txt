import VerificationEmail from '@/components/email/VerificationEmailTemplate';
import { resend } from '@/lib/resend';
import { APIresponse } from '@/types/apiResponse'


export async function sendVerification(
    email: string,
    username: string,
    verifyCode: string
): Promise<APIresponse> {
    try {

        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Unfiltered.txt | Verification Code ',
            react: VerificationEmail({ username: username , otp : verifyCode }),
        });

        return { success: true, message: 'Send verification email successfully !' }

    } catch (emailError) {
        console.error("error sending verification email", emailError)
        return { success: false, message: 'Failed to send verification email' }
    }
}