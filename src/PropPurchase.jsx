import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { fetchWithErrorHandling } from './fetchHelper';

function PropPurchase() {
  const [email, setEmail] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPriceSelected, setIsPriceSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const defaultWalletAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

  const propPrices = [
    { cost: 5, propValue: 500 },
    { cost: 13, propValue: 1000 },
    { cost: 20, propValue: 1500 },
    { cost: 30, propValue: 2000 },
    { cost: 40, propValue: 3000 },
    { cost: 50, propValue: 5000 },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        setEmail(user.email || '');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const restrictToEnglish = (value) => {
    const regex = /^[a-zA-Z0-9@._-]*$/;
    return regex.test(value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value) => {
    if (!restrictToEnglish(value)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Only English characters are allowed for email',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    setEmail(value);
  };
  
  const sendConfirmationEmail = async () => {
    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }

    if (!selectedProp) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a prop package',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    
    setIsLoading(true);
    let code = '';
    try {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const templateParams = {
        to_email: email,
        confirmation_code: code,
        amount: selectedProp.cost.toString(),
        prop_value: selectedProp.propValue.toString(),
        wallet_address: defaultWalletAddress,
      };

      console.log('Preparing to email send confirmation via email:', { templateParams });

      if (!templateParams.to_email || !templateParams.confirmation_code || !templateParams.amount || !templateParams.prop_value || !templateParams.wallet_address) {
        throw new Error('One or more template parameters are missing or invalid');
      }

      const response = await axios.post(
        'http://localhost:3001/api/send-email',
        {
          to: templateParams.to_email,
          subject: 'Prop Purchase Confirmation Code',
          text: `Dear User,\nYour confirmation code for purchasing a ${templateParams.prop_value} Prop for ${templateParams.amount} USD is: ${templateParams.confirmation_code}.\nPlease send payment to wallet address: ${templateParams.wallet_address}\nRegards,\nYour App Team`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Backend Response:', response.data);

      setIsCodeSent(true);
      localStorage.setItem('confirmationCode', code);
      localStorage.setItem('usedWalletAddress', defaultWalletAddress);
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: `Confirmation sent to code your email. Please send $${selectedProp.cost} to wallet address: ${defaultWalletAddress}`,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    } catch (error) {
      console.error('Email Sending Error:', {
        message: error.message || 'No error message available',
        status: error.response?.status || 'Unknown',
        response: error.response?.data || 'No response data',
        templateParams: {
          to_email: email || 'Not set',
          confirmation_code: code || localStorage.getItem('confirmationCode') || 'Not generated',
          amount: selectedProp?.cost?.toString() || 'Not selected',
          prop_value: selectedProp?.propValue?.toString() || 'Not selected',
          wallet_address: defaultWalletAddress || 'Not set',
        },
      });

      let errorMessage = 'Failed to send confirmation email. Please try again later.';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid email configuration. Please check backend settings.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized API request. Please verify your Sender API key in backend.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sender API endpoint not found. Please verify the API endpoint.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and backend server.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Email Error',
        text: errorMessage,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmPurchase = async () => {
    const storedCode = localStorage.getItem('confirmationCode');
    const usedWalletAddress = localStorage.getItem('usedWalletAddress') || defaultWalletAddress;

    if (confirmationCode !== storedCode) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: 'The confirmation code is incorrect',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const userData = await fetchWithErrorHandling('GET', `users/${userId}`);
      const newPropBalance = (userData?.propBalance || 0) + selectedProp.propValue;

      await setDoc(doc(db, 'propPurchases', `${userId}_${Date.now()}`), {
        userId,
        email: auth.currentUser.email,
        propValue: selectedProp.propValue,
        cost: selectedProp.cost,
        timestamp: serverTimestamp(),
      });

      await fetchWithErrorHandling('PATCH', `users/${userId}`, {
        propBalance: newPropBalance,
        propStatus: true,
        lastWalletAddress: usedWalletAddress,
      });

      Swal.fire({
        icon: 'success',
        title: 'Purchase Confirmed',
        text: `Prop balance updated to $${newPropBalance}`,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });

      localStorage.removeItem('confirmationCode');
      localStorage.removeItem('usedWalletAddress');
      setIsCodeSent(false);
      setConfirmationCode('');
      setSelectedProp(null);
      setIsPriceSelected(false);
      navigate('/trade');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Purchase Error',
        text: error.message || 'Failed to confirm purchase',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl',
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
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center px-4 py-8 relative overflow-hidden font-poppins">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] relative z-10" style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}>
        <h2 className="text-3xl font-bold text-white mb-6 text-center font-orbitron">Purchase Cosmic Prop</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2 font-poppins">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-sm text-white font-poppins"
              style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
              disabled={isCodeSent}
            />
          </div>
          {!isPriceSelected && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 font-poppins">Select Prop Package</label>
              <div className="grid grid-cols-2 gap-3">
                {propPrices.map((prop) => (
                  <button
                    key={prop.cost}
                    onClick={() => {
                      setSelectedProp(prop);
                      setIsPriceSelected(true);
                    }}
                    className="p-3 rounded-lg border border-gray-600 border-opacity-50 text-white text-sm font-medium hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins"
                    style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
                  >
                    ${prop.cost} - ${prop.propValue} Cosmic Prop
                  </button>
                ))}
              </div>
            </div>
          )}
          {isPriceSelected && !isCodeSent && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-200 mb-2 font-poppins">
                  Selected Package: ${selectedProp.cost} for ${selectedProp.propValue} Cosmic Prop
                </p>
                <p className="text-sm text-gray-200 font-poppins">
                  Please send payment to: <span className="font-semibold text-white">{defaultWalletAddress}</span>
                </p>
              </div>
              <button
                onClick={sendConfirmationEmail}
                className="w-full p-3 rounded-lg border border-gray-600 border-opacity-50 text-white text-sm font-medium transition-all duration-500 hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] flex items-center justify-center font-poppins"
                style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  'Send Confirmation Code'
                )}
              </button>
            </>
          )}
          {isCodeSent && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2 font-poppins">Confirmation Code</label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter Confirmation Code"
                  className="w-full p-3 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-sm text-white font-poppins"
                  style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
                />
              </div>
              <button
                onClick={confirmPurchase}
                className="w-full p-3 rounded-lg border border-gray-600 border-opacity-50 text-white text-sm font-medium transition-all duration-500 hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] flex items-center justify-center font-poppins"
                style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </>
          )}
        </div>
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

export default PropPurchase;