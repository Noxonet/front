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
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
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
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
        },
      });
      return;
    }

    if (!selectedProp) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a prop package',
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
        },
      });
      return;
    }
    
    setIsLoading(true);
    let code = ''; // تعریف کد در خارج از try
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
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-extrabold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
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
          prop_value: selectedProp?.selected?.propValue?.toString() || 'Not selected',
          wallet_address: defaultWalletAddress || 'Not set',
        },
      });

      let errorMessage = 'Failed to send confirmation email. Please try again later.';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid email configuration. Please check backend settings.';
        if (error.response?.status === 401) {
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
            confirmButtonColor: '#facc15',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white shadow-2xl rounded-lg animate-object',
              title: 'text-lg sm:text-xl font-bold text-gray-900',
              content: 'text-gray-700 text-sm sm:text-base',
              confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
            },
        });
        }
        setIsLoading(false)
  };
  }
  
  const confirmPurchase = async () => {
    const storedCode = localStorage.getItem('confirmationCode');
    const usedWalletAddress = localStorage.getItem('usedWalletAddress') || defaultWalletAddress;

    if (confirmationCode !== storedCode) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: 'The confirmation code is incorrect',
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
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

      // ذخیره تراکنش پراپ توی propPurchases
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
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
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
        confirmButtonColor: '#facc15',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-object',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Purchase Prop
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Email"
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors text-sm text-gray-900"
              disabled={isCodeSent}
            />
          </div>
          {!isPriceSelected && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Prop Package</label>
              <div className="grid grid-cols-2 gap-3">
                {propPrices.map((prop) => (
                  <button
                    key={prop.cost}
                    onClick={() => {
                      setSelectedProp(prop);
                      setIsPriceSelected(true);
                    }}
                    className="bg-yellow-100 text-yellow-800 p-3 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    ${prop.cost} - ${prop.propValue} Prop
                  </button>
                ))}
              </div>
            </div>
          )}
          {isPriceSelected && !isCodeSent && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Package: ${selectedProp.cost} for ${selectedProp.propValue} Prop
                </p>
                <p className="text-sm text-gray-600">
                  Please send payment to: <span className="font-semibold text-yellow-600">{defaultWalletAddress}</span>
                </p>
              </div>
              <button
                onClick={sendConfirmationEmail}
                className="w-full bg-yellow-400 text-gray-900 p-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-gray-900" viewBox="0 0 24 24">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Code</label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter Confirmation Code"
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors text-sm text-gray-900"
                />
              </div>
              <button
                onClick={confirmPurchase}
                className="w-full bg-yellow-400 text-gray-900 p-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-gray-900" viewBox="0 0 24 24">
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
    </div>
  );
}

export default PropPurchase;