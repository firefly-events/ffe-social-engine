import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white">Create your account</h1>
        <p className="text-slate-400 text-sm mt-1">Start creating AI-powered content today</p>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#9333ea',
            colorBackground: 'transparent',
            colorText: '#f1f5f9',
            colorTextSecondary: '#94a3b8',
            colorInputBackground: 'rgba(255,255,255,0.05)',
            colorInputText: '#f1f5f9',
            borderRadius: '0.75rem',
          },
          elements: {
            card: 'shadow-none bg-transparent',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
            formFieldInput: 'border-white/10 bg-white/5 text-slate-100 placeholder-slate-500',
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
            footerActionLink: 'text-purple-400 hover:text-purple-300',
            dividerLine: 'bg-white/10',
            dividerText: 'text-slate-500',
          },
        }}
        forceRedirectUrl="/dashboard"
      />
    </div>
  )
}
