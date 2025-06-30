import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { UserPlus } from 'lucide-react';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('token', token);
      const newReferralCode = generateReferralCode();
      const userData = {
        email,
        referralCode: newReferralCode,
        balance: 0, // Balance starts at 0, bonus needs to be claimed
        hasSignupBonus: true,
        hasSignupBonusClaimed: false,
        hasFirstDepositBonus: false,
        hasFirstDepositBonusClaimed: false,
        referralCount: 0,
        referredBy: referralCode || null,
        createdAt: Date.now(),
      };
      await fetchWithErrorHandling('PUT', `users/${userCredential.user.uid}`, userData);
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
      Swal.fire({
        icon: 'success',
        title: 'Signup Successful',
        text: `Your Referral Code: ${newReferralCode}\nPlease claim your $5 Signup Bonus in Tasks`,
        timer: 3000,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      navigate('/tasks');
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters';
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API secret, please contact support';
      }
      Swal.fire({
        icon: 'error',
        title: 'Signup Error',
        text: errorMessage,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <UserPlus className="w-8 h-8 text-gray-800 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Signup</h2>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 bg-gray-50 !text-black rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-4 bg-gray-50 !text-black rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
        />
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Referral Code (Optional)"
          className="w-full p-3 mb-6 bg-gray-50 !text-black rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            'Signup'
          )}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;