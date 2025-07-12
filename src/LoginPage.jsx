import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { LogIn } from 'lucide-react';

function LoginPage({ setIsLoggedIn, setBalance, updateBalance }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
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

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('token', token);
      const userData = await fetchWithErrorHandling('GET', `users/${userCredential.user.uid}`);
      if (!userData) {
        await fetchWithErrorHandling('PATCH', `users/${userCredential.user.uid}`, {
          email,
          balance: 0,
          mainBalance: 0,
          propBalance: 0,
          propStatus: false
        });
      }
      setIsLoggedIn(true);
      setBalance(userData?.balance || 0);
      await updateBalance();

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        timer: 1000,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      navigate('/');
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password';
      } else if (error.message.includes('User data not found')) {
        errorMessage = 'User data not found, please sign up';
        navigate('/signup');
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API key, please contact support';
      }
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
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
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-md w-full mx-auto p-8 bg-[#f0f8ff17] backdrop-blur-lg rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 relative z-10 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-white mr-2" />
          <h2 className="text-3xl font-bold text-white font-orbitron">Login</h2>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => handleInputChange(e.target.value, 'email', setEmail)}
          placeholder="Email"
          className="w-full p-3 mb-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-sm text-white font-poppins placeholder-gray-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => handleInputChange(e.target.value, 'password', setPassword)}
          placeholder="Password"
          className="w-full p-3 mb-6 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-sm text-white font-poppins placeholder-gray-400"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 flex items-center justify-center text-sm font-poppins border border-gray-600 border-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            'Login'
          )}
        </button>
        <p className="text-center text-sm text-gray-200 mt-4 font-poppins">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline transition-all duration-500">
            Sign up
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

export default LoginPage;