import { Auth } from '@/components/Auth'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Diamond Analyzer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to analyze your diamond certificates
          </p>
        </div>
        <Auth />
      </div>
    </div>
  )
} 