// Razorpay payment utility
// Opens Razorpay checkout and returns a promise that resolves with payment response

export function openRazorpay({ amount, name, description, prefill, onSuccess, onFailure }) {
  return new Promise((resolve, reject) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'LandPulse',
      description,
      image: '/logo.png',
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
      },
      theme: { color: '#c9a84c' },
      handler: function (response) {
        resolve(response)
        if (onSuccess) onSuccess(response)
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled'))
          if (onFailure) onFailure()
        },
      },
    }

    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Check your internet connection.'))
      return
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response) {
      reject(new Error(response.error.description))
      if (onFailure) onFailure(response.error)
    })
    rzp.open()
  })
}

// Subscription plan details
export const RE_PLANS = {
  monthly: {
    label: 'Monthly',
    price: 999,
    predictions: 60,
    listings: 1,
    duration: 30,   // days
    durationLabel: '1 Month',
  },
  quarterly: {
    label: 'Quarterly',
    price: 2499,
    predictions: 200,
    listings: 2,
    duration: 90,
    durationLabel: '3 Months',
  },
  yearly: {
    label: 'Yearly',
    price: 7999,
    predictions: 999999,
    listings: 999999,
    duration: 365,
    durationLabel: '1 Year',
  },
}

export const USER_PLANS = {
  oneTime: {
    label: 'One-Time Access',
    price: 49,
    description: 'Unlock contact details for this property',
  },
  monthly: {
    label: 'Monthly Access',
    price: 199,
    description: 'View all property contact details for 30 days',
    duration: 30,
  },
}
