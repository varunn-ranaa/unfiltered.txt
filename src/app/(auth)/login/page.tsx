import { Suspense } from "react"
import SignInForm from "@/components/SignInForm"
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}