import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, ref as dbRef, set, remove } from 'firebase/database';
import { auth, rtdb } from './firebase';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

function ListToken() {
  const [tokenId, setTokenId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenIdError, setTokenIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listedTokens, setListedTokens] = useState([]);
  const navigate = useNavigate();
  const tokenIdRef = useRef(null);
  const passwordRef = useRef(null);

  // Fetch listed tokens for the current user
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchListedTokens = async () => {
      try {
        const listedTokensRef = dbRef(rtdb, `tokenUsers/${auth.currentUser.uid}/ListedTokensList`);
        const snapshot = await get(listedTokensRef);
        if (snapshot.exists()) {
          const tokensData = snapshot.val();
          const tokensArray = Object.entries(tokensData).map(([key, value]) => ({
            tokenId: key,
            ...value,
          }));
          setListedTokens(tokensArray);
        } else {
          setListedTokens([]);
        }
      } catch (error) {
        console.error('Error fetching listed tokens:', error);
      }
    };

    fetchListedTokens();
  }, []);

  const validateTokenId = (value) => {
    if (!value) return 'Token ID is required';
    if (value.length !== 16) return 'Token ID must be 16 characters';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Token ID must be alphanumeric';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length !== 12) return 'Password must be 12 characters';
    if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test(value)) return 'Password contains invalid characters';
    return '';
  };

  const handleListToken = useCallback(async () => {
    setTokenIdError('');
    setPasswordError('');
    setIsLoading(true);

    const tokenIdValidation = validateTokenId(tokenId);
    const passwordValidation = validatePassword(password);

    if (tokenIdValidation || passwordValidation) {
      setTokenIdError(tokenIdValidation);
      setPasswordError(passwordValidation);
      setIsLoading(false);
      return;
    }

    if (!auth.currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Please log in to list a token',
        confirmButtonColor: '#1E3A8A',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      navigate('/login');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking token:', tokenId); // Debug log
      // Get all documents in DigitTokens
      const tokensRef = dbRef(rtdb, 'DigitTokens');
      const tokensSnap = await get(tokensRef);
      console.log('Tokens snapshot:', tokensSnap.exists(), tokensSnap.val()); // Debug log

      let tokenData = null;
      let actualTokenId = null;

      if (tokensSnap.exists()) {
        tokensSnap.forEach((childSnap) => {
          const data = childSnap.val();
          if (data.randomToken === tokenId) {
            tokenData = data;
            actualTokenId = childSnap.key;
          }
        });
      }

      if (!tokenData) {
        setTokenIdError('Token ID does not exist');
        setIsLoading(false);
        return;
      }

      console.log('Found token:', actualTokenId, tokenData); // Debug log

      if (tokenData.randomPassword !== password) {
        setPasswordError('Incorrect password');
        setIsLoading(false);
        return;
      }

      // Check if token is already listed in ListedTokens
      const listedTokenRef = dbRef(rtdb, `ListedTokens/${actualTokenId}`);
      const listedTokenSnap = await get(listedTokenRef);
      if (listedTokenSnap.exists()) {
        Swal.fire({
          icon: 'error',
          title: 'Token Already Listed',
          text: 'This token is already listed',
          confirmButtonColor: '#1E3A8A',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        setIsLoading(false);
        return;
      }

      // Prepare data to save
      const listedData = {
        tokenId: actualTokenId,
        randomToken: tokenData.randomToken,
        password,
        userId: auth.currentUser.uid,
        listedAt: new Date().toISOString(),
        name: tokenData.name,
        supply: tokenData.supply,
        createdAt: tokenData.createdAt,
      };

      // Save to ListedTokens
      await set(listedTokenRef, listedData);

      // Save to user's ListedTokensList
      const userListedTokenRef = dbRef(rtdb, `tokenUsers/${auth.currentUser.uid}/ListedTokensList/${actualTokenId}`);
      await set(userListedTokenRef, listedData);

      // Update local state
      setListedTokens((prev) => [...prev, listedData]);

      Swal.fire({
        icon: 'success',
        title: 'Token Listed',
        html: `
          <div style="text-align: left;">
            <p><strong>Token ID:</strong> ${actualTokenId}</p>
            <p><strong>Random Token:</strong> ${tokenData.randomToken}</p>
            <p><strong>Name:</strong> ${tokenData.name}</p>
            <p><strong>Total Supply:</strong> ${tokenData.supply}</p>
            <p><strong>Listed At:</strong> ${new Date(listedData.listedAt).toLocaleString()}</p>
          </div>
        `,
        confirmButtonColor: '#1E3A8A',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });

      setTokenId('');
      setPassword('');
    } catch (error) {
      console.error('Error listing token:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Listing Token',
        text: error.message,
        confirmButtonColor: '#1E3A8A',
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
  }, [tokenId, password]);

  const handleDeleteToken = useCallback(async (tokenId) => {
    Swal.fire({
      icon: 'warning',
      title: 'Delete Token',
      text: `Are you sure you want to delete the token ${tokenId}?`,
      showCancelButton: true,
      confirmButtonColor: '#1E3A8A',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
        content: 'text-gray-200 text-sm sm:text-base font-poppins',
        confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-500 font-poppins',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete from ListedTokens and user's ListedTokensList
          const listedTokenRef = dbRef(rtdb, `ListedTokens/${tokenId}`);
          const userListedTokenRef = dbRef(rtdb, `tokenUsers/${auth.currentUser.uid}/ListedTokensList/${tokenId}`);
          await Promise.all([remove(listedTokenRef), remove(userListedTokenRef)]);

          // Update local state
          setListedTokens((prev) => prev.filter((token) => token.tokenId !== tokenId));

          Swal.fire({
            icon: 'success',
            title: 'Token Deleted',
            text: `Token ${tokenId} was successfully deleted`,
            confirmButtonColor: '#1E3A8A',
            customClass: {
              popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
              content: 'text-gray-200 text-sm sm:text-base font-poppins',
              confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
            },
          });
        } catch (error) {
          console.error('Error deleting token:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error Deleting Token',
            text: error.message,
            confirmButtonColor: '#1E3A8A',
            customClass: {
              popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
              content: 'text-gray-200 text-sm sm:text-base font-poppins',
              confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
            },
          });
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-orbitron mb-6 sm:mb-8">List a Token</h1>

          {/* Token List */}
          {listedTokens.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4">Your Listed Tokens</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listedTokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
                  >
                    <div className="text-gray-200 text-sm sm:text-base font-poppins">
                      <p><strong>Token ID:</strong> {token.tokenId}</p>
                      <p><strong>Random Token:</strong> {token.randomToken}</p>
                      <p><strong>Name:</strong> {token.name}</p>
                      <p><strong>Total Supply:</strong> {token.supply}</p>
                      <p><strong>Listed At:</strong> {new Date(token.listedAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteToken(token.tokenId)}
                      className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 hover:shadow-[0_0_12px_rgba(220,38,38,0.5)] transition-all duration-500 font-poppins text-sm sm:text-base flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span>Delete Token</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Token Form */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: '#f0f8ff17', backdropFilter: 'blur(10px)' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4">Add New Token</h2>
            <div className="mb-4">
              <label htmlFor="token-id" className="block text-sm sm:text-base font-medium text-gray-200 font-orbitron">Token ID</label>
              <input
                type="text"
                id="token-id"
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value);
                  setTokenIdError(validateTokenId(e.target.value));
                }}
                ref={tokenIdRef}
                className="w-full p-2 sm:p-3 rounded-md bg-black bg-opacity-80 backdrop-blur-lg text-white border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-all duration-500"
                placeholder="Enter Token ID"
              />
              {tokenIdError && <p className="text-red-500 text-xs sm:text-sm mt-1 font-poppins">{tokenIdError}</p>}
            </div>
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-200 font-orbitron">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                ref={passwordRef}
                className="w-full p-2 sm:p-3 rounded-md bg-black bg-opacity-80 backdrop-blur-lg text-white border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-all duration-500"
                placeholder="Enter Password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-10 sm:top-11 p-1 sm:p-2 rounded-full hover:bg-black hover:bg-opacity-50 hover:shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all duration-500"
              >
                {showPassword ? (
                  <EyeOff className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                ) : (
                  <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                )}
              </button>
              {passwordError && <p className="text-red-500 text-xs sm:text-sm mt-1 font-poppins">{passwordError}</p>}
            </div>
            <button
              onClick={handleListToken}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 disabled:bg-gray-700 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-blue-800 border-opacity-50 shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-sm sm:text-base font-poppins"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Listing...</span>
                </div>
              ) : (
                'List Token'
              )}
            </button>
          </div>
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

export default ListToken;