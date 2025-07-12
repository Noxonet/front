import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth } from "./firebase";
import { fetchWithErrorHandling } from "./fetchHelper";
import { Send, Copy } from "lucide-react";

function DepositPage({ updateBalance }) {
  const cryptoTokens = [
    {
      symbol: "USDT",
      icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png",
    },
  ];
  const addresses = [
    { id: 1, chanel: "BEP2", addr: "bnb1ys2g3ssskz4t6yqs238nj0pe8ncsjwq6rhjrxg" },
    { id: 2, chanel: "BEP20", addr: "0xb41f0c5b54B0d8Dc8b8073a443cAC79078E1C234" },
    { id: 3, chanel: "OPBNB", addr: "0xb41f0c5b54B0d8Dc8b8073a443cAC79078E1C234" },
    { id: 4, chanel: "ERC20", addr: "0xb41f0c5b54B0d8Dc8b8073a443cAC79078E1C234" },
    { id: 5, chanel: "SPL", addr: "BExDCrBHMp2bDxXkCBtrEbvq5fmK4HAZRQpxyUg81oEA" },
    { id: 6, chanel: "TRC20", addr: "TPurncuZQBjb2WN2JmnvMdYFUYoH2ZXW9H" },
  ];
  const [selectValue, setSelectValue] = useState("BEP20");
  const [countUsd, setCountUsd] = useState('');
  const [showBox, setShowBox] = useState(false);
  const [walletAddress, setWalletAddress] = useState("TQbxf1wEuhY3vH5Ku3bB4qX64PWk2CPvfL");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const restrictToEnglish = (value, type) => {
    let regex;
    if (type === 'amount') regex = /^[0-9.]*$/;
    return regex.test(value);
  };

  const handleInputChange = (value, type, setter) => {
    if (!restrictToEnglish(value, type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Only English numbers are allowed',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    setter(value);
  };

  const addressChangeHandler = (e) => {
    setSelectValue(e.target.value);
    const address = addresses.find((item) => item.chanel === e.target.value);
    if (address) {
      setWalletAddress(address.addr);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    Swal.fire({
      icon: "success",
      title: "Address Copied",
      timer: 1000,
      customClass: {
        popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
        title: "text-lg sm:text-xl font-bold text-white font-orbitron",
        confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
      },
    });
  };

  const handleDeposit = async () => {
    if (!countUsd) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Amount is required",
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
      return;
    }
    const amount = parseFloat(countUsd);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter a valid positive amount",
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
      return;
    }
    if (amount < 5) {
      Swal.fire({
        icon: "error",
        title: "Minimum Deposit",
        text: "Minimum deposit is 5 USDT",
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
      return;
    }

    setIsLoading(true);
    if (!auth.currentUser) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in first",
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
      navigate("/login");
      setIsLoading(false);
      return;
    }
    try {
      const userData = await fetchWithErrorHandling("GET", `users/${auth.currentUser.uid}`);
      if (!userData) {
        throw new Error("User data not found");
      }
      let fee = 0;
      if (selectValue === "BEP20") fee = 0.5;
      else if (selectValue === "ERC20") fee = 2;
      else if (selectValue === "TRC20") fee = 1;
      const finalAmount = amount - fee;

      let updateData = {
        balance: (userData.balance || 0) + finalAmount,
      };
      let bonusMessage = "";
      if (!userData.hasFirstDepositBonus) {
        updateData.hasFirstDepositBonus = true;
        bonusMessage = "\nPlease claim your $10 First Deposit Bonus in Tasks";
      }
      await fetchWithErrorHandling("PATCH", `users/${auth.currentUser.uid}`, updateData);
      const updatedData = await fetchWithErrorHandling("GET", `users/${auth.currentUser.uid}`);
      updateBalance();
      Swal.fire({
        icon: "success",
        title: "Deposit Successful",
        text: `New balance: ${updatedData.balance.toFixed(2)} USDT\nFee: ${fee} USDT${bonusMessage}`,
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
      navigate("/tasks");
    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes("User data not found")) {
        errorMessage = "User data not found, please sign up";
        navigate("/signup");
      } else if (error.message.includes("Unauthorized")) {
        errorMessage = "Invalid API secret, please contact support";
        localStorage.removeItem("token");
        auth.signOut();
        navigate("/login");
      }
      Swal.fire({
        icon: "error",
        title: "Deposit Error",
        text: errorMessage,
        confirmButtonColor: "#1E3A8A",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white font-orbitron",
          content: "text-gray-200 text-sm sm:text-base font-poppins",
          confirmButton: "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Deposit</h1>
          {isPending ? (
            <NavLink
              onClick={() => setIsPending(false)}
              className="text-xs sm:text-sm text-gray-200 hover:text-blue-400 font-poppins"
            >
              Back to Assets
            </NavLink>
          ) : (
            <NavLink to="/assets" className="text-xs sm:text-sm text-gray-200 hover:text-blue-400 font-poppins">
              Back to Assets
            </NavLink>
          )}
        </div>
        {isPending ? (
          <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] max-w-lg mx-auto">
            <p className="p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-gray-200 bg-[#f0f8ff17] backdrop-blur-lg border border-gray-600 border-opacity-50 mb-3 font-poppins">
              The amount below must exactly match your deposit amount to protect against bots and hackers.
            </p>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Amount (USDT)</label>
              <input
                type="number"
                value={countUsd}
                onChange={(e) => handleInputChange(e.target.value, 'amount', setCountUsd)}
                placeholder="Minimum 5 USDT"
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleDeposit}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white" />
                  Confirm Deposit
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] max-w-lg mx-auto">
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Select Network</label>
                <select
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
                  value={selectValue}
                  onChange={addressChangeHandler}
                >
                  {addresses.map((item) => (
                    <option key={item.id} className="text-xs sm:text-sm text-white font-poppins" value={item.chanel}>
                      {item.chanel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowBox(true)}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 flex items-center justify-center mb-3"
              disabled={isLoading}
            >
              <Send className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white" />
              Show Deposit Address
            </button>
            {showBox && (
              <div className="bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-lg border border-gray-600 border-opacity-50 mb-3">
                <p className="text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Deposit Address:</p>
                <p className="text-xs sm:text-sm font-mono break-all mb-2 text-white font-poppins">{walletAddress}</p>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 text-xs sm:text-sm text-gray-200 hover:text-blue-400 font-poppins"
                >
                  <Copy className="w-4 h-4 text-white" />
                  Copy Address
                </button>
              </div>
            )}
            <button
              onClick={() => setIsPending(true)}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white" />
                  Confirm Deposit
                </>
              )}
            </button>
          </div>
        )}
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
        input::placeholder, select::placeholder {
          color: #D1D5DB !important;
          opacity: 1;
        }
        input::-webkit-input-placeholder, select::-webkit-input-placeholder {
          color: #D1D5DB !important;
        }
        input::-moz-placeholder, select::-moz-placeholder {
          color: #D1D5DB !important;
        }
        input:-ms-input-placeholder, select:-ms-input-placeholder {
          color: #D1D5DB !important;
        }
        input, select, button {
          min-height: 44px;
        }
      `}</style>
    </div>
  );
}

export default DepositPage;