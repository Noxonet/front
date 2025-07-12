import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

// Environment variables
const WALLET_ADDRESS = 'process.env.REACT_APP_WALLET_ADDRESS' || import.meta.env.VITE_WALLET_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const COINGECKO_API_KEY = 'process.env.REACT_APP_COINGECKO_API_KEY' || import.meta.env.VITE_COINGECKO_API_KEY || '';

const TradingPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [propBalance, setPropBalance] = useState(10000);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [orderType, setOrderType] = useState('market');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartData, setChartData] = useState([]);

  const coins = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  ];

  const generateMockAreaData = () => {
    const data = [];
    const startTime = new Date('2025-07-01').getTime();
    let price = 50000;
    for (let i = 0; i < 7; i++) {
      const time = startTime + i * 24 * 3600000;
      price += (Math.random() - 0.5) * 1000;
      data.push([time, price]);
    }
    return data;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || 'fisa5551@gmail.com');
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setPropBalance(docSnap.data().propBalance || 10000);
        } else {
          setError('User data not found. Please contact support.');
        }
      } else {
        setError('Please log in to your account first.');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: coins.map((coin) => coin.id).join(','),
              order: 'market_cap_desc',
              per_page: 5,
              page: 1,
              sparkline: false,
            },
            headers: COINGECKO_API_KEY ? { 'X-Cg-Api-Key': COINGECKO_API_KEY } : {},
          }
        );
        const prices = {};
        response.data.forEach((coin) => {
          prices[coin.id] = coin.current_price;
        });
        setCurrentPrices(prices);
        if (orderType === 'market' && !buyPrice) {
          setBuyPrice(prices[selectedCoin]?.toFixed(2) || '');
        }
      } catch (err) {
        setError('Failed to fetch real-time prices. Please check your API key or try again later.');
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [selectedCoin, orderType]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: 7,
              interval: 'daily',
            },
            headers: COINGECKO_API_KEY ? { 'X-Cg-Api-Key': COINGECKO_API_KEY } : {},
          }
        );
        const data = response.data.prices.map(([timestamp, price]) => [
          timestamp,
          price,
        ]);
        setChartData(data);
      } catch (err) {
        setError('Failed to fetch chart data. Using default chart. Consider adding a CoinGecko API key.');
        setChartData(generateMockAreaData());
      }
    };
    fetchChartData();
  }, [selectedCoin]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (orderStatus && orderStatus.status === 'pending') {
        const bp = parseFloat(orderStatus.buyPrice);
        const currentPrice = currentPrices[selectedCoin];
        if (orderType === 'limit' && currentPrice <= bp) {
          setOrderStatus({ ...orderStatus, status: 'executed' });
          setSuccess('Limit order executed successfully.');
        }
      }
      if (orderStatus && orderStatus.status === 'executed') {
        const bp = parseFloat(orderStatus.buyPrice);
        const qty = parseFloat(orderStatus.quantity);
        const tp = parseFloat(takeProfit);
        const sl = parseFloat(stopLoss);
        const currentPrice = currentPrices[selectedCoin];
        if (tp && currentPrice >= tp) {
          const profit = (tp - bp) * qty;
          updateBalance(propBalance + profit);
          setOrderStatus(null);
          setSuccess(`Order closed with ${profit.toFixed(2)} USD profit.`);
          setError('');
        } else if (sl && currentPrice <= sl) {
          const loss = (bp - sl) * qty;
          updateBalance(propBalance - loss);
          setOrderStatus(null);
          setSuccess(`Order closed with ${loss.toFixed(2)} USD loss.`);
          setError('');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderStatus, takeProfit, stopLoss, propBalance, currentPrices, selectedCoin]);

  const updateBalance = async (newBalance) => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, { propBalance: newBalance });
      setPropBalance(newBalance);
    }
  };

  const handleBuy = () => {
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0.0001) {
      setError('Please enter a valid quantity (minimum 0.0001).');
      return;
    }
    const qty = parseFloat(quantity);
    const currentPrice = currentPrices[selectedCoin] || 0;
    const bp = orderType === 'market' ? currentPrice : parseFloat(buyPrice);
    const totalCost = bp * qty;

    if (isNaN(bp) || bp <= 0) {
      setError('Please enter a valid buy price.');
      return;
    }
    if (totalCost > propBalance || totalCost < 10) {
      setError('Insufficient balance or order below minimum ($10).');
      return;
    }
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    if (tp && tp <= bp) {
      setError('Take profit must be higher than buy price.');
      return;
    }
    if (sl && sl >= bp) {
      setError('Stop loss must be lower than buy price.');
      return;
    }

    const order = {
      buyPrice: bp,
      quantity: qty,
      orderType,
      status: orderType === 'market' ? 'executed' : 'pending',
      coin: selectedCoin,
      symbol: coins.find((c) => c.id === selectedCoin).symbol,
      takeProfit: tp,
      stopLoss: sl,
    };
    setOrderStatus(order);
    setSuccess(
      orderType === 'market'
        ? 'Market order executed successfully.'
        : 'Limit order placed successfully.'
    );
    setError('');
  };

  const handleCancelOrder = () => {
    setOrderStatus(null);
    setSuccess('Order canceled.');
    setError('');
  };

  const chartOptions = {
    chart: {
      type: 'area',
      height: 400,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#1E3A8A'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#6B7280'],
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: '#D1D5DB', fontFamily: 'Poppins, sans-serif' },
        format: 'dd MMM',
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
        style: { colors: '#D1D5DB', fontFamily: 'Poppins, sans-serif' },
      },
    },
    annotations: {
      yaxis: [
        {
          y: currentPrices[selectedCoin] || 0,
          borderColor: '#1E3A8A',
          label: {
            text: 'Current Price',
            style: { color: '#fff', background: '#1E3A8A', fontFamily: 'Poppins, sans-serif' },
          },
        },
        orderStatus && takeProfit && orderStatus.coin === selectedCoin
          ? {
              y: parseFloat(takeProfit),
              borderColor: '#10B981',
              label: {
                text: 'Take Profit',
                style: { color: '#fff', background: '#10B981', fontFamily: 'Poppins, sans-serif' },
              },
            }
          : {},
        orderStatus && stopLoss && orderStatus.coin === selectedCoin
          ? {
              y: parseFloat(stopLoss),
              borderColor: '#EF4444',
              label: {
                text: 'Stop Loss',
                style: { color: '#fff', background: '#EF4444', fontFamily: 'Poppins, sans-serif' },
              },
            }
          : {},
      ],
    },
    grid: { borderColor: '#4B5563' },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: { format: 'dd MMM yyyy' },
      style: { fontFamily: 'Poppins, sans-serif' },
    },
  };

  const chartSeries = [
    {
      name: `${coins.find((c) => c.id === selectedCoin)?.symbol}/USD`,
      data: chartData,
    },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron text-center mb-4 sm:mb-6">
          Trading Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Form */}
          <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white font-orbitron mb-4">Place Order</h2>
            <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">
              User: {userEmail || 'Loading...'}
            </p>
            <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">
              Wallet: {WALLET_ADDRESS}
            </p>
            <p className="text-xs sm:text-sm text-gray-200 mb-4 font-poppins">
              Prop Balance: ${propBalance.toFixed(2)}
            </p>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Select Coin:</label>
              <select
                value={selectedCoin}
                onChange={(e) => {
                  setSelectedCoin(e.target.value);
                  setBuyPrice(orderType === 'market' ? currentPrices[e.target.value]?.toFixed(2) || '' : '');
                }}
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
              >
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Order Type:</label>
              <select
                value={orderType}
                onChange={(e) => {
                  setOrderType(e.target.value);
                  setBuyPrice(e.target.value === 'market' ? currentPrices[selectedCoin]?.toFixed(2) || '' : '');
                }}
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
              >
                <option value="market">Market Order</option>
                <option value="limit">Limit Order</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Buy Price ($):</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder={`Current: $${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}`}
                disabled={orderType === 'market'}
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">
                Quantity ({coins.find((c) => c.id === selectedCoin)?.symbol}):
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Example: 0.001"
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Take Profit (Optional) ($):</label>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Example: 51000"
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">Stop Loss (Optional) ($):</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Example: 49000"
                className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleBuy}
              disabled={orderStatus}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
            {orderStatus && (
              <button
                onClick={handleCancelOrder}
                className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 mt-3"
              >
                Cancel Order
              </button>
            )}
            {error && (
              <p className="text-center text-xs sm:text-sm text-red-500 mt-3 font-poppins">{error}</p>
            )}
            {success && (
              <p className="text-center text-xs sm:text-sm text-green-500 mt-3 font-poppins">{success}</p>
            )}
            {orderStatus && (
              <div className="mt-4 bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
                <h3 className="text-base sm:text-lg font-semibold text-white font-orbitron mb-3">Open Order</h3>
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Coin: <span className="font-semibold">{orderStatus.symbol}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Order Type: <span className="font-semibold">{orderStatus.orderType.toUpperCase()}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Status: <span className="font-semibold">{orderStatus.status.toUpperCase()}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Buy Price: <span className="font-semibold">${orderStatus.buyPrice.toFixed(2)}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Quantity: <span className="font-semibold">{orderStatus.quantity.toFixed(4)} {orderStatus.symbol}</span>
                </p>
                {orderStatus.takeProfit && (
                  <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                    Take Profit: <span className="font-semibold text-green-500">${orderStatus.takeProfit.toFixed(2)}</span>
                  </p>
                )}
                {orderStatus.stopLoss && (
                  <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                    Stop Loss: <span className="font-semibold text-red-500">${orderStatus.stopLoss.toFixed(2)}</span>
                  </p>
                )}
                <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                  Current Price: <span className="font-semibold">${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}</span>
                </p>
              </div>
            )}
          </div>
          {/* Chart */}
          <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white font-orbitron mb-3">
              Price Chart ({coins.find((c) => c.id === selectedCoin)?.symbol}/USD)
            </h2>
            <Chart options={chartOptions} series={chartSeries} type="area" height="300" className="w-full" />
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
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
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
        select, input, button {
          min-height: 44px;
        }
      `}</style>
    </div>
  );
};

export default TradingPage;