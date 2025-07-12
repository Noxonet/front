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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    if (!password) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password is required',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 6 characters',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center px-4 relative overflow-hidden font-poppins">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] relative z-10" style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <UserPlus className="w-6 sm:w-8 h-6 sm:h-8 text-white mr-1 sm:mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-orbitron">Join Cosmic Trade</h2>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => handleInputChange(e.target.value, 'email', setEmail)}
          placeholder="Email"
          className="w-full p-2 sm:p-3 mb-3 sm:mb-4 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
          style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => handleInputChange(e.target.value, 'password', setPassword)}
          placeholder="Password"
          className="w-full p-2 sm:p-3 mb-3 sm:mb-4 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
          style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
        />
        <input
          type="text"
          value={referralCode}
          onChange={(e) => handleInputChange(e.target.value, 'referral', setReferralCode)}
          placeholder="Referral Code (Optional)"
          className="w-full p-2 sm:p-3 mb-4 sm:mb-6 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
          style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
        />
        <button
          onClick={handleSignup}
          className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 border-opacity-50 text-white text-xs sm:text-sm font-medium transition-all duration-500 hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] flex items-center justify-center font-poppins"
          style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
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
        <p className="text-center text-xs sm:text-sm text-gray-200 mt-3 sm:mt-4 font-poppins">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-blue-500 hover:underline transition-all duration-500">
            Login
          </Link>
        </p>
      </div>
      <style jsx>{`
        .stars {
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        .stars::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(2px 2px at 20px 30px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 40px 70px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 50px 160px, #ddd 1px, transparent 0),
                      radial-gradient(2px 2px at 90px 40px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 130px 80px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 160px 120px, #ddd 1px, transparent 0);
          background-size: 250px 250px;
          animation: twinkle 10s infinite linear;
          opacity: 0.3;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

export default SignupPage;