import React from 'react';
import { FaExchangeAlt, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { Select, MenuItem, FormControl, InputLabel, TextField, Slider } from '@mui/material';

const OrderForm = ({
  selectedCoin, setSelectedCoin, orderType, setOrderType, tradeType, setTradeType,
  buyPrice, setBuyPrice, amountInUSD, setAmountInUSD, leverage, setLeverage,
  takeProfit, setTakeProfit, stopLoss, setStopLoss, currentPrices, propBalance,
  handleBuy, handleCancelOrder, orderStatus, userEmail, error, success, loading,
  COINS, MIN_AMOUNT_USD, MIN_LEVERAGE, MAX_LEVERAGE, WALLET_ADDRESS
}) => {
  return (
    <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] lg:col-span-1 animate-fadeIn">
      <h2 className="text-lg sm:text-xl font-semibold text-white font-orbitron mb-4 flex items-center">
        <FaExchangeAlt className="mr-2" /> Place Order
      </h2>
      <p className="text-xs sm:text-sm text-gray-200 mb-3 font-vazirmatn">User: {userEmail || 'Loading...'}</p>
      <p className="text-xs sm:text-sm text-gray-200 mb-3 font-vazirmatn">Wallet: {WALLET_ADDRESS}</p>
      <p className="text-xs sm:text-sm text-gray-200 mb-4 font-vazirmatn">Balance: <span className="font-semibold">${propBalance.toFixed(2)}</span></p>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', '&.Mui-focused': { color: '#3B82F6' } }}>
          Select Coin
        </InputLabel>
        <Select
          value={selectedCoin}
          onChange={(e) => {
            setSelectedCoin(e.target.value);
            setBuyPrice(orderType === 'market' ? currentPrices[e.target.value]?.toFixed(2) || '' : '');
          }}
          sx={{
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            '& .MuiSvgIcon-root': { color: '#D1D5DB' },
            '&:hover': { boxShadow: '0 0 12px rgba(30, 58, 138, 0.5)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          }}
        >
          {COINS.map((coin) => (
            <MenuItem key={coin.id} value={coin.id}>
              {coin.name} ({coin.symbol})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', '&.Mui-focused': { color: '#3B82F6' } }}>
          Order Type
        </InputLabel>
        <Select
          value={orderType}
          onChange={(e) => {
            setOrderType(e.target.value);
            setBuyPrice(e.target.value === 'market' ? currentPrices[selectedCoin]?.toFixed(2) || '' : '');
          }}
          sx={{
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            '& .MuiSvgIcon-root': { color: '#D1D5DB' },
            '&:hover': { boxShadow: '0 0 12px rgba(30, 58, 138, 0.5)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          }}
        >
          <MenuItem value="market">Market Order</MenuItem>
          <MenuItem value="limit">Limit Order</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', '&.Mui-focused': { color: '#3B82F6' } }}>
          Trade Type
        </InputLabel>
        <Select
          value={tradeType}
          onChange={(e) => setTradeType(e.target.value)}
          sx={{
            background: tradeType === 'long'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.35))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.35))',
            backdropFilter: 'blur(12px)',
            border: tradeType === 'long'
              ? '1px solid rgba(16, 185, 129, 0.6)'
              : '1px solid rgba(239, 68, 68, 0.6)',
            borderRadius: '10px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            '& .MuiSvgIcon-root': { color: '#D1D5DB' },
            '&:hover': {
              boxShadow: tradeType === 'long'
                ? '0 0 15px rgba(16, 185, 129, 0.4)'
                : '0 0 15px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.4s ease-in-out',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tradeType === 'long' ? '#10B981' : '#EF4444',
              borderWidth: '2px',
            },
          }}
        >
          <MenuItem value="long">Long</MenuItem>
          <MenuItem value="short">Short</MenuItem>
        </Select>
      </FormControl>
      <div className={`mb-2 p-4 rounded-lg transition-all duration-400 ${
        tradeType === 'long'
          ? 'bg-gradient-to-r from-green-900/15 to-green-700/15 border border-green-500/60'
          : 'bg-gradient-to-r from-red-900/15 to-red-700/15 border border-red-500/60'
      } hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]`}>
        <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-vazirmatn">
          Leverage ({leverage}x)
        </label>
        <Slider
          value={leverage}
          onChange={(e, newValue) => setLeverage(newValue)}
          min={MIN_LEVERAGE}
          max={MAX_LEVERAGE}
          step={1}
          valueLabelDisplay="auto"
          sx={{
            color: tradeType === 'long' ? '#10B981' : '#EF4444',
            '& .MuiSlider-rail': { backgroundColor: '#4B5563' },
            '& .MuiSlider-track': { backgroundColor: tradeType === 'long' ? '#10B981' : '#EF4444' },
            '& .MuiSlider-thumb': {
              backgroundColor: '#fff',
              '&:hover': { boxShadow: `0 0 0 10px ${tradeType === 'long' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` },
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: tradeType === 'long' ? '#10B981' : '#EF4444',
              color: '#fff',
              fontFamily: 'Vazirmatn, sans-serif',
              borderRadius: '6px',
            },
          }}
        />
      </div>
      <TextField
        label="Buy Price ($)"
        type="number"
        value={buyPrice}
        onChange={(e) => setBuyPrice(e.target.value)}
        placeholder={`Current: $${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}`}
        disabled={orderType === 'market'}
        fullWidth
        sx={{
          mb: 1.8,
          '& .MuiInputBase-root': {
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            height: '48px',
            padding: '0 10px',
          },
          '& .MuiInputLabel-root': { 
            color: '#D1D5DB', 
            fontFamily: 'Vazirmatn, sans-serif',
            fontSize: '1rem',
            transform: 'translate(14px, 14px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& input': { 
            padding: '10px 0',
            fontSize: '1rem',
          },
          '& input::placeholder': { color: '#D1D5DB', fontSize: '1rem' },
        }}
        inputProps={{ step: '0.01' }}
      />
      <TextField
        label="Amount (USD)"
        type="number"
        value={amountInUSD}
        onChange={(e) => setAmountInUSD(e.target.value)}
        placeholder={`Minimum: ${MIN_AMOUNT_USD}`}
        fullWidth
        sx={{
          mb: 1.8,
          '& .MuiInputBase-root': {
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            height: '48px',
            padding: '0 10px',
          },
          '& .MuiInputLabel-root': { 
            color: '#D1D5DB', 
            fontFamily: 'Vazirmatn, sans-serif',
            fontSize: '1rem',
            transform: 'translate(14px, 14px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& input': { 
            padding: '10px 0',
            fontSize: '1rem',
          },
          '& input::placeholder': { color: '#D1D5DB', fontSize: '1rem' },
        }}
        inputProps={{ step: '0.01' }}
      />
      <TextField
        label={tradeType === 'long' ? 'Take Profit (Optional) ($)' : 'Take Profit (Optional) ($) (Lower than Buy Price)'}
        type="number"
        value={takeProfit}
        onChange={(e) => setTakeProfit(e.target.value)}
        placeholder={tradeType === 'long' ? 'Example: 51000' : 'Example: 49000'}
        fullWidth
        sx={{
          mb: 1.8,
          '& .MuiInputBase-root': {
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            height: '48px',
            padding: '0 10px',
          },
          '& .MuiInputLabel-root': { 
            color: '#D1D5DB', 
            fontFamily: 'Vazirmatn, sans-serif',
            fontSize: '1rem',
            transform: 'translate(14px, 14px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& input': { 
            padding: '10px 0',
            fontSize: '1rem',
          },
          '& input::placeholder': { color: '#D1D5DB', fontSize: '1rem' },
        }}
        inputProps={{ step: '0.01' }}
      />
      <TextField
        label={tradeType === 'long' ? 'Stop Loss (Optional) ($)' : 'Stop Loss (Optional) ($) (Higher than Buy Price)'}
        type="number"
        value={stopLoss}
        onChange={(e) => setStopLoss(e.target.value)}
        placeholder={tradeType === 'long' ? 'Example: 49000' : 'Example: 51000'}
        fullWidth
        sx={{
          mb: 1.8,
          '& .MuiInputBase-root': {
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif',
            height: '48px',
            padding: '0 10px',
          },
          '& .MuiInputLabel-root': { 
            color: '#D1D5DB', 
            fontFamily: 'Vazirmatn, sans-serif',
            fontSize: '1rem',
            transform: 'translate(14px, 14px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
          '& input': { 
            padding: '10px 0',
            fontSize: '1rem',
          },
          '& input::placeholder': { color: '#D1D5DB', fontSize: '1rem' },
        }}
        inputProps={{ step: '0.01' }}
      />
      <div className="mb-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-vazirmatn">Risk/Reward Ratio:</label>
        <div className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
          {buyPrice && amountInUSD && takeProfit && stopLoss
            ? tradeType === 'long'
              ? ((parseFloat(takeProfit) - parseFloat(buyPrice)) / (parseFloat(buyPrice) - parseFloat(stopLoss))).toFixed(2)
              : ((parseFloat(buyPrice) - parseFloat(takeProfit)) / (parseFloat(stopLoss) - parseFloat(buyPrice))).toFixed(2)
            : 'N/A'}
        </div>
      </div>
      <button
        onClick={handleBuy}
        disabled={orderStatus || loading}
        className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-vazirmatn border border-gray-600 border-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
      {orderStatus && (
        <button
          onClick={handleCancelOrder}
          className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-500 text-xs sm:text-sm font-vazirmatn border border-gray-600 border-opacity-50 mt-3"
        >
          <FaTimesCircle className="inline mr-1" /> Cancel Order
        </button>
      )}
      {error && (
        <p className="text-center text-xs sm:text-sm text-red-500 mt-3 font-vazirmatn">{error}</p>
      )}
      {success && (
        <p className="text-center text-xs sm:text-sm text-green-500 mt-3 font-vazirmatn">{success}</p>
      )}
      {orderStatus && (
        <div className="mt-4 bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] animate-fadeIn">
          <h3 className="text-base sm:text-lg font-semibold text-white font-vazirmatn mb-3 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" /> Open Order
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Coin: <span className="font-semibold">{orderStatus.symbol}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Trade Type: <span className="font-semibold">{orderStatus.tradeType ? (orderStatus.tradeType === 'long' ? 'Long' : 'Short') : 'Long'}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Order Type: <span className="font-semibold">{orderType === 'market' ? 'Market' : 'Limit'}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Leverage: <span className="font-semibold">{orderStatus.leverage}x</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Status: <span className="font-semibold">{orderStatus.status === 'pending' ? 'Pending' : 'Executed'}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Buy Price: <span className="font-semibold">${orderStatus.buyPrice.toFixed(2)}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Quantity: <span className="font-semibold">{orderStatus.quantity.toFixed(4)} {orderStatus.symbol}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Amount: <span className="font-semibold">${orderStatus.amountInUSD.toFixed(2)}</span>
          </p>
          {orderStatus.takeProfit && (
            <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
              Take Profit: <span className="font-semibold text-green-500">${orderStatus.takeProfit.toFixed(2)}</span>
            </p>
          )}
          {orderStatus.stopLoss && (
            <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
              Stop Loss: <span className="font-semibold text-red-500">${orderStatus.stopLoss.toFixed(2)}</span>
            </p>
          )}
          <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">
            Current Price: <span className="font-semibold">${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderForm;