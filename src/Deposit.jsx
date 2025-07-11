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
        popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
        title: "text-lg sm:text-xl font-bold text-white",
        confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
      },
    });
  };

  const handleDeposit = async () => {
    if (!countUsd) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Amount is required",
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
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
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
        },
      });
      return;
    }
    if (amount < 5) {
      Swal.fire({
        icon: "error",
        title: "Minimum Deposit",
        text: "Minimum deposit is 5 USDT",
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
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
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
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
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
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
        confirmButtonColor: "#7F00FF",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-white",
          content: "text-gray-300 text-sm sm:text-base",
          confirmButton: "bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
      <div className="mx-auto px-4 sm:px-6 max-w-3xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Deposit</h1>
          {isPending ? (
            <NavLink
              onClick={() => setIsPending(false)}
              className="text-sm text-purple-400 hover:underline"
            >
              Back to Assets
            </NavLink>
          ) : (
            <NavLink to="/assets" className="text-sm text-purple-400 hover:underline">
              Back to Assets
            </NavLink>
          )}
        </div>

        {isPending ? (
          <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20">
            <p className="p-3 rounded-xl text-xs md:text-base text-purple-400 bg-gray-900 bg-opacity-20 backdrop-blur-lg border border-purple-500 border-opacity-20">
              The amount below must exactly match your deposit amount to protect against bots and hackers.
            </p>
            <div className="my-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={countUsd}
                onChange={(e) => handleInputChange(e.target.value, 'amount', setCountUsd)}
                placeholder="Minimum 5 USDT"
                className="w-full p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm text-white"
              />
            </div>
            <button
              onClick={handleDeposit}
              className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors flex items-center justify-center shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2 text-purple-400" />
                  Confirm Deposit
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Network</label>
                <select
                  className="w-full p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm text-white"
                  value={selectValue}
                  onChange={addressChangeHandler}
                >
                  {addresses.map((item) => (
                    <option key={item.id} className="text-sm text-white" value={item.chanel}>
                      {item.chanel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowBox(true)}
              className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors flex items-center justify-center mb-4 shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
              disabled={isLoading}
            >
              <Send className="w-5 h-5 mr-2 text-purple-400" />
              Show Deposit Address
            </button>
            {showBox && (
              <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg p-4 rounded-lg border border-gray-700 border-opacity-20 mb-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Deposit Address:</p>
                <p className="text-sm font-mono break-all mb-2 text-white">{walletAddress}</p>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 text-sm text-purple-400 hover:underline"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                  Copy Address
                </button>
              </div>
            )}
            <button
              onClick={() => setIsPending(true)}
              className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors flex items-center justify-center shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2 text-purple-400" />
                  Confirm Deposit
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepositPage;