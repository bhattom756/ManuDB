import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { loginSchema } from '@/lib/validations'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, error, clearError } = useAuth()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Show loading toast immediately
    const loadingToast = toast.loading('Logging you in...', {
      duration: Infinity, // Keep loading toast until dismissed
    })
    
    try {
      console.log('Attempting login with:', data.email)
      const response = await login(data.email, data.password)
      console.log('Login response:', response)
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Welcome back! Redirecting to dashboard...', {
        duration: 2000,
      })
      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (error) {
      console.error('Login error:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error(error.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Panel - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-8 text-center">
                  Sign in
                </h2>

                <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
                  or use your account
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              disabled={isLoading}
                              className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:border-orange-500 dark:focus:border-orange-400 text-gray-900 dark:text-white transition-all duration-200 ${
                                fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                              {...field}
                              onBlur={(e) => {
                                field.onBlur();
                                form.trigger('email');
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                if (fieldState.error) {
                                  form.trigger('email');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                disabled={isLoading}
                                className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:border-orange-500 dark:focus:border-orange-400 text-gray-900 dark:text-white transition-all duration-200 pr-12 ${
                                  fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                                {...field}
                                onBlur={(e) => {
                                  field.onBlur();
                                  form.trigger('password');
                                }}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (fieldState.error) {
                                    form.trigger('password');
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-right">
                      <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Forgot your password?
                      </Link>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'SIGN IN'}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* Right Panel - Welcome Section */}
            <div className="lg:w-1/2 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center p-8 lg:p-12">
              <div className="text-center text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Hello, Friend!
                </h1>
                <p className="text-lg lg:text-xl mb-8 opacity-90 leading-relaxed">
                  Enter your personal details and start journey with us
                </p>
                <Link to="/signup">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
                  >
                    SIGN UP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}