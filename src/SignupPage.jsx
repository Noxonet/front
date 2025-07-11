import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { UserPlus } from 'lucide-react';

function SignupPage({ setIsLoggedIn, setBalance, updateBalance }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const restrictToEnglish = (value, type) => {
    let regex;
    if (type === 'email') regex = /^[a-zA-Z0-9@._-]*$/;
    else if (type === 'password') regex = /^[a-zA-Z0-9!@#$%^&*]*$/;
    else if (type === 'referral') regex = /^[a-zA-Z0-9]*$/;
    return regex.test(value);
  };

  const handleInputChange = (value, type, setter) => {
    if (!restrictToEnglish(value, type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Only English characters are allowed',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }
    setter(value);
  };

  const handleSignup = async () => {
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email is required',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }
    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }
    if (!password) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password is required',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 6 characters',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('token', token);

      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const userData = {
        email,
        referralCode: newReferralCode,
        balance: 0,
        hasSignupBonus: true,
        hasSignupBonusClaimed: false,
        hasFirstDepositBonus: false,
        hasFirstDepositBonusClaimed: false,
        referralCount: 0,
        claimedReferralBonus: 0,
        referredBy: referralCode || null,
        createdAt: Date.now(),
        mainBalance: 0,
        propBalance: 0,
        propStatus: false
      };

      await fetchWithErrorHandling('PATCH', `users/${userCredential.user.uid}`, userData);

      if (referralCode) {
        const usersData = await fetchWithErrorHandling('GET', 'users');
        let inviterUid = null;
        for (const [uid, data] of Object.entries(usersData || {})) {
          if (data.referralCode === referralCode) {
            inviterUid = uid;
            break;
          }
        }
        if (inviterUid) {
          const inviterData = await fetchWithErrorHandling('GET', `users/${inviterUid}`);
          if (inviterData) {
            await fetchWithErrorHandling('PATCH', `users/${inviterUid}`, {
              referralCount: (inviterData.referralCount || 0) + 1,
            });
          }
        }
      }

      setIsLoggedIn(true);
      setBalance(0);
      await updateBalance();

      Swal.fire({
        icon: 'success',
        title: 'Signup Successful',
        text: `Your Referral Code: ${newReferralCode}\nPlease claim your $5 Signup Bonus in Tasks`,
        timer: 3000,
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });

      setTimeout(() => {
        navigate('/prop-purchase');
      }, 1000);
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters';
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API key, please contact support';
      }
      Swal.fire({
        icon: 'error',
        title: 'Signup Error',
        text: errorMessage,
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
      <div className="w-full max-w-md p-6 sm:p-8 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20 relative z-10">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <UserPlus className="w-6 sm:w-8 h-6 sm:h-8 text-purple-400 mr-1 sm:mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Signup</h2>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => handleInputChange(e.target.value, 'email', setEmail)}
          placeholder="Email"
          className="w-full p-2 sm:p-3 mb-3 sm:mb-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => handleInputChange(e.target.value, 'password', setPassword)}
          placeholder="Password"
          className="w-full p-2 sm:p-3 mb-3 sm:mb-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white"
        />
        <input
          type="text"
          value={referralCode}
          onChange={(e) => handleInputChange(e.target.value, 'referral', setReferralCode)}
          placeholder="Referral Code (Optional)"
          className="w-full p-2 sm:p-3 mb-4 sm:mb-6 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-2 sm:p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors flex items-center justify-center text-xs sm:text-sm shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            'Signup'
          )}
        </button>
        <p className="text-center text-xs sm:text-sm text-gray-300 mt-3 sm:mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;