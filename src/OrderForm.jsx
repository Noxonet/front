
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaDollarSign, FaChartLine, FaWallet } from 'react-icons/fa';

const OrderForm = ({
  selectedCoin,
  setSelectedCoin,
  orderType,
  setOrderType,
  tradeType,
  setTradeType,
  buyPrice,
  setBuyPrice,
  amountInUSD,
  setAmountInUSD,
  leverage,
  setLeverage,
  takeProfit,
  setTakeProfit,
  stopLoss,
  setStopLoss,
  currentPrices,
  propBalance,
  handleBuy,
  handleInitialPurchase,
  orderStatus,
  userEmail,
  error,
  success,
  loading,
  COINS,
  MIN_AMOUNT_USD,
  MIN_LEVERAGE,
  MAX_LEVERAGE,
  WALLET_ADDRESS,
  listedTokens,
}) => {
  const [showInitialPurchase, setShowInitialPurchase] = useState(false);

  useEffect(() => {
    const token = listedTokens.find(t => t.id === selectedCoin);
    setShowInitialPurchase(token && token.purchasedAmount === 0);
  }, [selectedCoin, listedTokens]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showInitialPurchase) {
      const token = listedTokens.find(t => t.id === selectedCoin);
      if (token) {
        handleInitialPurchase(token.id, amountInUSD, buyPrice);
      }
    } else {
      handleBuy();
    }
  };

  return (
    <div className="bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 lg:col-span-1 animate-fadeIn">
      <h2 className="text-base sm:text-lg font-semibold text-white font-vazirmatn mb-2">فرم سفارش</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">انتخاب ارز:</label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full p-1 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
          >
            {COINS.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>
        {showInitialPurchase ? (
          <>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">قیمت خرید اولیه (دلار):</label>
              <div className="relative">
                <FaDollarSign className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder="قیمت خرید اولیه"
                  step="0.000001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">مقدار (دلار):</label>
              <div className="relative">
                <FaDollarSign className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={amountInUSD}
                  onChange={(e) => setAmountInUSD(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder={`حداقل ${MIN_AMOUNT_USD} دلار`}
                  step="0.01"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs sm:text-sm p-2 rounded-md hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 font-vazirmatn"
            >
              {loading ? 'در حال پردازش...' : 'خرید اولیه و فعال‌سازی توکن'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">نوع سفارش:</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full p-1 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
              >
                <option value="market">مارکت</option>
                <option value="limit">لیمیت</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">نوع معامله:</label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="w-full p-1 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
              >
                <option value="long">لانگ</option>
                <option value="short">شورت</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">قیمت خرید (دلار):</label>
              <div className="relative">
                <FaDollarSign className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder="قیمت خرید"
                  step="0.000001"
                  disabled={orderType === 'market'}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">مقدار (دلار):</label>
              <div className="relative">
                <FaDollarSign className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={amountInUSD}
                  onChange={(e) => setAmountInUSD(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder={`حداقل ${MIN_AMOUNT_USD} دلار`}
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">اهرم:</label>
              <input
                type="number"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full p-1 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                placeholder={`اهرم (${MIN_LEVERAGE}x-${MAX_LEVERAGE}x)`}
                min={MIN_LEVERAGE}
                max={MAX_LEVERAGE}
                step="1"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">سود هدف (دلار):</label>
              <div className="relative">
                <FaChartLine className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder="سود هدف (اختیاری)"
                  step="0.000001"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-200 font-vazirmatn">حد ضرر (دلار):</label>
              <div className="relative">
                <FaChartLine className="absolute left-2 top-2.5 text-gray-400" />
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full p-1 pl-7 rounded-md bg-[#f0f8ff05] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-vazirmatn text-xs sm:text-sm"
                  placeholder="حد ضرر (اختیاری)"
                  step="0.000001"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs sm:text-sm p-2 rounded-md hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 font-vazirmatn"
            >
              {loading ? 'در حال پردازش...' : 'ثبت سفارش'}
            </button>
          </>
        )}
      </form>
      {error && <p className="text-red-500 text-xs sm:text-sm mt-2 font-vazirmatn">{error}</p>}
      {success && <p className="text-green-500 text-xs sm:text-sm mt-2 font-vazirmatn">{success}</p>}
      <div className="mt-2 text-gray-200 text-xs sm:text-sm font-vazirmatn">
        <p className="flex items-center"><FaWallet className="mr-1" /> موجودی: ${propBalance.toFixed(2)}</p>
        <p>ایمیل: {userEmail}</p>
        <p>آدرس کیف‌پول: {WALLET_ADDRESS}</p>
      </div>
    </div>
  );
};

export default OrderForm;
