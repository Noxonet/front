import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';

function PropPurchase() {
  const [email, setEmail] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPriceSelected, setIsPriceSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // آدرس کیف پول ثابت سایت
  const defaultWalletAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

  // لیست قیمت‌های پراپ
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
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
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
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      return;
    }

    if (!selectedProp) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a prop package',
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const templateParams = {
        to_email: email,
        confirmation_code: code,
        amount: selectedProp.cost,
        prop_value: selectedProp.propValue,
        wallet_address: defaultWalletAddress,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setIsCodeSent(true);
      localStorage.setItem('confirmationCode', code);
      localStorage.setItem('usedWalletAddress', defaultWalletAddress);
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: `Confirmation code sent to your email. Please send $${selectedProp.cost} to wallet: ${defaultWalletAddress}`,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Email Error',
        text: 'Failed to send confirmation email',
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
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
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
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

      await fetchWithErrorHandling('PATCH', `users/${userId}`, {
        propBalance: newPropBalance,
        propStatus: true,
        lastWalletAddress: usedWalletAddress,
      });

      Swal.fire({
        icon: 'success',
        title: 'Purchase Confirmed',
        text: `Prop balance updated to $${newPropBalance}`,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
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
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4 py-8">
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
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm text-gray-900"
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
                    className="bg-indigo-100 text-indigo-800 p-3 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
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
                  Please send payment to: <span className="font-semibold text-indigo-600">{defaultWalletAddress}</span>
                </p>
              </div>
              <button
                onClick={sendConfirmationEmail}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Code</label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter Confirmation Code"
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm text-gray-900"
                />
              </div>
              <button
                onClick={confirmPurchase}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
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
    </div>
  );
}

export default PropPurchase;