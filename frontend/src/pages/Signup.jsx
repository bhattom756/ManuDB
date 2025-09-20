import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { signupSchema } from '@/lib/validations'
import PasswordStrengthIndicator from '@/components/ui/password-strength'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()

  const form = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const watchedPassword = form.watch('password')
  const watchedConfirmPassword = form.watch('confirmPassword')

  // Re-validate confirm password when main password changes
  React.useEffect(() => {
    if (watchedConfirmPassword) {
      form.trigger('confirmPassword')
    }
  }, [watchedPassword, watchedConfirmPassword, form])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Attempting registration with:', data.email)
      const response = await register({
        name: data.name,
        email: data.email,
        password: data.password
      })
      console.log('Registration response:', response)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Panel - Welcome Section */}
            <div className="lg:w-1/2 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center p-8 lg:p-12">
              <div className="text-center text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Hello, Friend!
                </h1>
                <p className="text-lg lg:text-xl mb-8 opacity-90 leading-relaxed">
                  Enter your personal details and start journey with us
                </p>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold transition-all duration-300"
                  >
                    SIGN IN
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8 text-center">
                  Create Account
                </h2>

                <p className="text-center text-gray-500 mb-8 text-sm">
                  or use your email for registration
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Name"
                              disabled={isLoading}
                              className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 transition-all duration-200 ${
                                fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                              {...field}
                              onBlur={(e) => {
                                field.onBlur();
                                form.trigger('name');
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                if (fieldState.error) {
                                  form.trigger('name');
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
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              disabled={isLoading}
                              className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 transition-all duration-200 ${
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
                                className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 transition-all duration-200 pr-12 ${
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                              </button>
                            </div>
                          </FormControl>
                          {watchedPassword && <PasswordStrengthIndicator password={watchedPassword} />}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                disabled={isLoading}
                                className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 transition-all duration-200 pr-12 ${
                                  fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                                {...field}
                                onBlur={(e) => {
                                  field.onBlur();
                                  form.trigger('confirmPassword');
                                }}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (fieldState.error) {
                                    form.trigger('confirmPassword');
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'SIGN UP'}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}