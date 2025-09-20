import React from 'react'

const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = (password) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }

    score = Object.values(checks).filter(Boolean).length

    return {
      score,
      checks,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    }
  }

  const { score, checks, strength } = getPasswordStrength(password)

  if (!password) return null

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Weak'
      case 'medium': return 'Medium'
      case 'strong': return 'Strong'
      default: return ''
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {getStrengthText()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center space-x-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{checks.length ? '✓' : '○'}</span>
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{checks.lowercase ? '✓' : '○'}</span>
          <span>Lowercase</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{checks.uppercase ? '✓' : '○'}</span>
          <span>Uppercase</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.number ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{checks.number ? '✓' : '○'}</span>
          <span>Number</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{checks.special ? '✓' : '○'}</span>
          <span>Special char</span>
        </div>
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator