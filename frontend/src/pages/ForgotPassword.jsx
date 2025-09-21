import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { z } from 'zod'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Sending password reset email to:', data.email)
      toast.loading('Sending reset email...', { id: 'forgot-password' })
      
      await authAPI.forgotPassword(data.email)
      
      console.log('Password reset email sent successfully')
      toast.success('Password reset email sent! Check your inbox.', { id: 'forgot-password' })
      setEmailSent(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.response?.data?.error || 'Failed to send reset email', { id: 'forgot-password' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = form.getValues('email')
    if (email) {
      await onSubmit({ email })
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We've sent a password reset link to <strong>{form.getValues('email')}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Didn't receive the email? Check your spam folder or</p>
                <Button
                  variant="link"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  resend the email
                </Button>
              </div>
              
              <div className="pt-4">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-gray-800 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          placeholder="Enter your email address"
                          disabled={isLoading}
                          className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-all duration-200 ${
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

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Remember your password? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
