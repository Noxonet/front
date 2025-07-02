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
        popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
        title: "text-lg sm:text-xl font-bold text-gray-900",
        confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
      },
    });
  };

  const handleDeposit = async () => {
    if (!countUsd) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Amount is required",
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
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
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
        },
      });
      return;
    }
    if (amount < 5) {
      Swal.fire({
        icon: "error",
        title: "Minimum Deposit",
        text: "Minimum deposit is 5 USDT",
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
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
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
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
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
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
        confirmButtonColor: "#1f2937",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]",
          title: "text-lg sm:text-xl font-bold text-gray-900",
          content: "text-gray-700 text-sm sm:text-base",
          confirmButton: "bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <div className="mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Deposit</h1>
          {isPending ? (
            <NavLink
              onClick={() => setIsPending(false)}
              className="text-sm text-yellow-500 hover:underline"
            >
              Back to Assets
            </NavLink>
          ) : (
            <NavLink to="/assets" className="text-sm text-yellow-500 hover:underline">
              Back to Assets
            </NavLink>
          )}
        </div>

        {isPending ? (
          <div className="bg-white rounded-2xl p-6 shadow-xl animate-fade-in">
            <p className="p-3 rounded-xl text-xs md:text-base text-yellow-500 bg-yellow-100 border border-yellow-500">
              The amount below must exactly match your deposit amount to protect against bots and hackers.
            </p>
            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={countUsd}
                onChange={(e) => handleInputChange(e.target.value, 'amount', setCountUsd)}
                placeholder="Minimum 5 USDT"
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors !text-black"
              />
            </div>
            <button
              onClick={handleDeposit}
              className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Confirm Deposit
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-xl animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Network</label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors !text-black"
                  value={selectValue}
                  onChange={addressChangeHandler}
                >
                  {addresses.map((item) => (
                    <option key={item.id} className="text-xs sm:text-sm" value={item.chanel}>
                      {item.chanel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowBox(true)}
              className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center mb-4"
              disabled={isLoading}
            >
              <Send className="w-5 h-5 mr-2" />
              Show Deposit Address
            </button>
            {showBox && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Deposit Address:</p>
                <p className="text-sm font-mono break-all mb-2">{walletAddress}</p>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 text-sm text-yellow-500 hover:underline"
                >
                  <Copy className="w-4 h-4" />
                  Copy Address
                </button>
              </div>
            )}
            <button
              onClick={() => setIsPending(true)}
              className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
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