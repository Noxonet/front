import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, rtdb } from './firebase';
import { ref, get, set } from 'firebase/database';
import { doc, updateDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import PriceChart from './PriceChart';
import OrderForm from './OrderForm';
import { FaHistory, FaExchangeAlt, FaTimesCircle } from 'react-icons/fa';

// Constants
const WALLET_ADDRESS = import.meta.env.VITE_WALLET_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const MIN_ORDER_VALUE = 10;
const MIN_AMOUNT_USD = 10;
const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 100;
const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
];
const CACHE_DURATION = 30000;

const TradingPage = ({ updateBalance = () => {} }) => {
  const [userEmail, setUserEmail] = useState('');
  const [mainBalance, setMainBalance] = useState(0); // Initial value 0
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('long');
  const [buyPrice, setBuyPrice] = useState('');
  const [amountInUSD, setAmountInUSD] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const priceCache = useMemo(() => new Map(), []);
  const chartDataCache = useMemo(() => new Map(), []);

  const generateMockPriceData = () => ({
    bitcoin: 60000,
    ethereum: 3000,
    binancecoin: 500,
    solana: 150,
    ripple: 0.5,
  });

  const generateMockChartData = () => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const timestamp = now - i * 60 * 60 * 1000;
      const price = 60000 + (Math.random() - 0.5) * 1000;
      data.push({ date: timestamp, open: price, high: price + 100, low: price - 100, close: price });
    }
    return data.reverse();
  };

  const showAlert = (type, title, text) => {
    Swal.fire({
      icon: type,
      title,
      text,
      customClass: {
        popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-white font-vazirmatn',
        content: 'text-gray-200 text-sm sm:text-base font-vazirmatn',
        confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-3 py-1 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-300 font-vazirmatn',
      },
    });
  };

  const fetchUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email || 'fisa5551@gmail.com');
      try {
        const balanceRef = ref(rtdb, `users/${user.uid}/balance`);
        const snapshot = await get(balanceRef);
        const fetchedBalance = snapshot.exists() ? snapshot.val() : null;
        if (fetchedBalance !== null && !isNaN(fetchedBalance)) {
          setMainBalance(fetchedBalance);
          updateBalance(fetchedBalance);
        } else {
          console.error('بالانس پیدا نشد، مقدار پیش‌فرض 0 تنظیم شد.');
          setMainBalance(0);
          updateBalance(0);
          await set(balanceRef, 0);
        }
      } catch (err) {
        console.error('خطا در گرفتن بالانس از Realtime Database:', err);
        setMainBalance(0);
        updateBalance(0);
        await set(ref(rtdb, `users/${user.uid}/balance`), 0);
        setError('Failed to fetch balance from database.');
        showAlert('error', 'Database Error', 'Unable to fetch balance from database. Balance set to 0.');
      }
    }
    setIsAuthLoaded(true);
  }, [updateBalance]);

  const fetchPrices = useCallback(async () => {
    const now = Date.now();
    if (priceCache.has('prices') && now - priceCache.get('timestamp') < CACHE_DURATION) {
      setCurrentPrices(priceCache.get('prices'));
      return;
    }

    try {
      setLoading(true);
      const ids = COINS.map(coin => coin.id).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, { timeout: 5000 });
      const data = await response.json();
      const prices = Object.fromEntries(COINS.map(coin => [coin.id, data[coin.id]?.usd || 0]));
      priceCache.set('prices', prices);
      priceCache.set('timestamp', now);
      setCurrentPrices(prices);
    } catch (err) {
      console.error('خطا در گرفتن قیمت‌ها:', err);
      const mockPrices = generateMockPriceData();
      priceCache.set('prices', mockPrices);
      priceCache.set('timestamp', now);
      setCurrentPrices(mockPrices);
    } finally {
      setLoading(false);
    }
  }, [priceCache]);

  const fetchChartData = useCallback(async (coin, timeframe) => {
    const cacheKey = `${coin}_${timeframe}`;
    if (chartDataCache.has(cacheKey) && Date.now() - chartDataCache.get(`${cacheKey}_timestamp`) < CACHE_DURATION) {
      setChartData(chartDataCache.get(cacheKey));
      return;
    }

    let days, interval;
    switch (timeframe) {
      case '1m': case '2m': case '5m': case '15m':
        days = 1;
        interval = timeframe;
        break;
      case '1h': case '2h': case '4h':
        days = 7;
        interval = timeframe;
        break;
      case '1d':
        days = 30;
        interval = 'daily';
        break;
      case '1w':
        days = 90;
        interval = 'weekly';
        break;
      default:
        days = 7;
        interval = '1h';
    }

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${days}`, { timeout: 5000 });
      const data = await response.json();
      const chartData = data.map(([timestamp, open, high, low, close]) => ({ date: timestamp, open, high, low, close }));
      if (chartData.length > 0) {
        chartDataCache.set(cacheKey, chartData);
        chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
        setChartData(chartData);
      }
    } catch (err) {
      console.error('خطا در گرفتن داده‌های چارت:', err);
      const mockData = generateMockChartData();
      chartDataCache.set(cacheKey, mockData);
      chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
      setChartData(mockData);
    }
  }, [chartDataCache]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    fetchChartData(selectedCoin, '1h');
  }, [fetchChartData, selectedCoin]);

  useEffect(() => {
    if (!isAuthLoaded || !auth.currentUser?.uid) return;

    const q = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid), where('status', 'in', ['pending', 'executed']));
    const unsubscribe = onSnapshot(q, (snapshot) => setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), tradeType: doc.data().tradeType || 'long' }))), (err) => {
      setError('Failed to fetch open orders.');
      showAlert('error', 'Orders Error', err.message);
    });

    const hq = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid), where('status', 'in', ['closed', 'canceled']));
    const unsubscribeHistory = onSnapshot(hq, (snapshot) => setHistoryOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), tradeType: doc.data().tradeType || 'long' }))), (err) => {
      setError('Failed to fetch order history.');
      showAlert('error', 'History Error', err.message);
    });

    return () => {
      unsubscribe();
      unsubscribeHistory();
    };
  }, [isAuthLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach(async (order) => {
        if (order.status === 'pending' && order.orderType === 'limit') {
          const bp = parseFloat(order.buyPrice);
          const currentPrice = currentPrices[order.coin];
          if (currentPrice && ((order.tradeType === 'long' && currentPrice <= bp) || (order.tradeType === 'short' && currentPrice >= bp))) {
            await updateDoc(doc(db, 'orders', order.id), { status: 'executed', executedAt: new Date().toISOString() });
            setSuccess('Limit order executed.');
            showAlert('success', 'Order Executed', `Limit order for ${order.symbol} executed.`);
          }
        }
        if (order.status === 'executed') {
          const { buyPrice, quantity, leverage, takeProfit, stopLoss, tradeType, coin } = order;
          const currentPrice = currentPrices[coin];
          if (takeProfit && currentPrice) {
            const shouldClose = tradeType === 'long' ? currentPrice >= takeProfit : currentPrice <= takeProfit;
            if (shouldClose) {
              const profit = tradeType === 'long' ? (takeProfit - buyPrice) * quantity * leverage : (buyPrice - takeProfit) * quantity * leverage;
              await handleOrderClose(order.id, profit, 'closed', 'Order closed with profit.');
            }
          }
          if (stopLoss && currentPrice) {
            const shouldClose = tradeType === 'long' ? currentPrice <= stopLoss : currentPrice >= stopLoss;
            if (shouldClose) {
              const loss = tradeType === 'long' ? (buyPrice - stopLoss) * quantity * leverage : (stopLoss - buyPrice) * quantity * leverage;
              await handleOrderClose(order.id, loss, 'closed', 'Order closed with loss.', true);
            }
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [orders, currentPrices, mainBalance]);

  const handleOrderClose = async (orderId, profitLoss, status, message, isLoss = false) => {
    const newBalance = mainBalance + (isLoss ? -profitLoss : profitLoss);
    if (newBalance < 0) {
      setError('Balance cannot be negative.');
      showAlert('error', 'Balance Error', 'Balance cannot be negative.');
      return;
    }
    await updateUserBalance(newBalance);
    await updateDoc(doc(db, 'orders', orderId), { status, closedAt: new Date().toISOString(), profitLoss });
    setSuccess(`${message} $${Math.abs(profitLoss).toFixed(2)}`);
    showAlert('success', 'Order Closed', `${message} $${Math.abs(profitLoss).toFixed(2)}`);
  };

  const updateUserBalance = async (newBalance) => {
    if (auth.currentUser) {
      try {
        await set(ref(rtdb, `users/${auth.currentUser.uid}/balance`), newBalance);
        setMainBalance(newBalance);
        updateBalance(newBalance);
      } catch (err) {
        console.error('خطا در آپدیت موجودی:', err);
        setError('Failed to update balance.');
        showAlert('error', 'Update Error', 'Unable to update balance.');
      }
    }
  };

  const handleBuy = async () => {
    if (!auth.currentUser) {
      setError('Please log in to your account.');
      showAlert('error', 'Login Required', 'Please log in to your account.');
      return;
    }
    const amount = parseFloat(amountInUSD);
    if (!amount || amount < MIN_AMOUNT_USD) {
      setError(`Minimum amount is $${MIN_AMOUNT_USD}.`);
      showAlert('error', 'Invalid Amount', `Minimum amount is $${MIN_AMOUNT_USD}.`);
      return;
    }
    if (leverage < MIN_LEVERAGE || leverage > MAX_LEVERAGE) {
      setError(`Leverage must be between ${MIN_LEVERAGE}x and ${MAX_LEVERAGE}x.`);
      showAlert('error', 'Invalid Leverage', `Leverage must be between ${MIN_LEVERAGE}x and ${MAX_LEVERAGE}x.`);
      return;
    }
    const currentPrice = currentPrices[selectedCoin];
    const bp = orderType === 'market' ? currentPrice : parseFloat(buyPrice);
    if (!bp || bp <= 0) {
      setError('Invalid buy price.');
      showAlert('error', 'Invalid Price', 'Invalid buy price.');
      return;
    }
    const actualAmount = amount / leverage;
    if (actualAmount > mainBalance || mainBalance <= 0) {
      setError('Insufficient balance.');
      showAlert('error', 'Balance Error', 'Insufficient balance.');
      return;
    }
    if (amount < MIN_ORDER_VALUE) {
      setError(`Minimum order value is $${MIN_ORDER_VALUE}.`);
      showAlert('error', 'Minimum Order', `Minimum order value is $${MIN_ORDER_VALUE}.`);
      return;
    }
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    if (tp && !((tradeType === 'long' && tp > bp) || (tradeType === 'short' && tp < bp))) {
      setError('Invalid take profit.');
      showAlert('error', 'Invalid Take Profit', 'Invalid take profit.');
      return;
    }
    if (sl && !((tradeType === 'long' && sl < bp) || (tradeType === 'short' && sl > bp))) {
      setError('Invalid stop loss.');
      showAlert('error', 'Invalid Stop Loss', 'Invalid stop loss.');
      return;
    }

    const order = {
      userId: auth.currentUser.uid,
      buyPrice: bp,
      quantity: (amount * leverage) / bp,
      leverage,
      orderType,
      tradeType,
      status: orderType === 'market' ? 'executed' : 'pending',
      coin: selectedCoin,
      symbol: COINS.find(c => c.id === selectedCoin).symbol,
      amountInUSD: amount,
      takeProfit: tp,
      stopLoss: sl,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await updateUserBalance(mainBalance - actualAmount);
      const docRef = await addDoc(collection(db, 'orders'), order);
      setOrderStatus({ ...order, id: docRef.id });
      setSuccess(`Order ${orderType === 'market' ? 'executed' : 'placed'} successfully.`);
      showAlert('success', 'Order Success', `Order ${orderType === 'market' ? 'executed' : 'placed'} for ${order.symbol}.`);
      setAmountInUSD('');
      setTakeProfit('');
      setStopLoss('');
      setLeverage(1);
      setBuyPrice(orderType === 'market' ? currentPrice?.toFixed(2) || '' : '');
    } catch (err) {
      setError('Failed to place order.');
      showAlert('error', 'Order Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (orderStatus?.id) {
      try {
        await updateDoc(doc(db, 'orders', orderStatus.id), { status: 'canceled', canceledAt: new Date().toISOString() });
        await updateUserBalance(mainBalance + orderStatus.amountInUSD / orderStatus.leverage);
        setOrderStatus(null);
        setSuccess('Order canceled successfully.');
        showAlert('success', 'Order Canceled', 'Order canceled successfully.');
      } catch (err) {
        setError('Failed to cancel order.');
        showAlert('error', 'Cancel Error', err.message);
      }
    }
  };

  const sortOrders = (orders) => [...orders].sort((a, b) => (sortOrder === 'desc' ? (a[sortBy] > b[sortBy] ? -1 : 1) : (a[sortBy] < b[sortBy] ? -1 : 1)));

  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-vazirmatn relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-3 sm:px-4 relative z-10">
        {isAuthLoaded && !auth.currentUser && <div className="text-center text-red-500 mb-3 font-vazirmatn">Please log in to your account.</div>}
        <h1 className="text-xl sm:text-2xl font-bold text-white font-vazirmatn text-center mb-3 sm:mb-4 animate-fadeIn">
          Trading Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <OrderForm
            selectedCoin={selectedCoin}
            setSelectedCoin={setSelectedCoin}
            orderType={orderType}
            setOrderType={setOrderType}
            tradeType={tradeType}
            setTradeType={setTradeType}
            buyPrice={buyPrice}
            setBuyPrice={setBuyPrice}
            amountInUSD={amountInUSD}
            setAmountInUSD={setAmountInUSD}
            leverage={leverage}
            setLeverage={setLeverage}
            takeProfit={takeProfit}
            setTakeProfit={setTakeProfit}
            stopLoss={stopLoss}
            setStopLoss={setStopLoss}
            currentPrices={currentPrices}
            propBalance={mainBalance}
            handleBuy={handleBuy}
            handleCancelOrder={handleCancelOrder}
            orderStatus={orderStatus}
            userEmail={userEmail}
            error={error}
            success={success}
            loading={loading}
            COINS={COINS}
            MIN_AMOUNT_USD={MIN_AMOUNT_USD}
            MIN_LEVERAGE={MIN_LEVERAGE}
            MAX_LEVERAGE={MAX_LEVERAGE}
            WALLET_ADDRESS={WALLET_ADDRESS}
          />
          <PriceChart
            selectedCoin={selectedCoin}
            currentPrices={currentPrices}
            chartData={chartData}
            orderStatus={orderStatus}
            takeProfit={takeProfit}
            stopLoss={stopLoss}
            tradeType={tradeType}
            generateMockChartData={generateMockChartData}
            COINS={COINS}
            fetchChartData={fetchChartData}
          />
        </div>
        {orders.length > 0 && (
          <div className="mt-4 bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 animate-fadeIn">
            <h2 className="text-base sm:text-lg font-semibold text-white font-vazirmatn mb-2 flex items-center">
              <FaExchangeAlt className="mr-1" /> Open Orders
            </h2>
            <div className="space-y-2">
              {sortOrders(orders).map((order) => (
                <div key={order.id} className="bg-[#f0f8ff05] p-2 rounded-md border border-gray-600 border-opacity-50 hover:bg-[#f0f8ff10] transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Coin: <span className="font-semibold">{order.symbol}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Type: <span className="font-semibold">{order.tradeType === 'long' ? 'Long' : 'Short'}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Order: <span className="font-semibold">{order.orderType}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Leverage: <span className="font-semibold">{order.leverage}x</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Status: <span className="font-semibold">{order.status}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">Price: <span className="font-semibold">${order.buyPrice.toFixed(2)}</span></p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'orders', order.id), { status: 'canceled', canceledAt: new Date().toISOString() });
                          await updateUserBalance(mainBalance + order.amountInUSD / order.leverage);
                          showAlert('success', 'Canceled', `${order.symbol} order canceled.`);
                        } catch (err) {
                          showAlert('error', 'Cancel Error', err.message);
                        }
                      }}
                      className="bg-gradient-to-r from-red-700 to-red-900 text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300"
                    >
                      <FaTimesCircle className="inline mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {historyOrders.length > 0 && (
          <div className="mt-4 bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 animate-fadeIn">
            <h2 className="text-base sm:text-lg font-semibold text-white font-vazirmatn mb-2 flex items-center">
              <FaHistory className="mr-1" /> Order History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-gray-200 font-vazirmatn">
                <thead>
                  <tr className="bg-[#f0f8ff05]">
                    <th className="p-1 text-left">Coin</th>
                    <th className="p-1 text-left">Type</th>
                    <th className="p-1 text-left">Order</th>
                    <th className="p-1 text-left">Leverage</th>
                    <th className="p-1 text-left">Status</th>
                    <th className="p-1 text-left">Price</th>
                    <th className="p-1 text-left">Quantity</th>
                    <th className="p-1 text-left">Amount</th>
                    <th className="p-1 text-left">Profit/Loss</th>
                    <th className="p-1 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortOrders(historyOrders).map((order) => (
                    <tr key={order.id} className="border-b border-gray-600 border-opacity-50 hover:bg-[#f0f8ff10] transition-all duration-300">
                      <td className="p-1">{order.symbol}</td>
                      <td className="p-1">{order.tradeType === 'long' ? 'Long' : 'Short'}</td>
                      <td className="p-1">{order.orderType}</td>
                      <td className="p-1">{order.leverage}x</td>
                      <td className="p-1">{order.status}</td>
                      <td className="p-1">${order.buyPrice.toFixed(2)}</td>
                      <td className="p-1">{order.quantity.toFixed(4)} {order.symbol}</td>
                      <td className="p-1">${order.amountInUSD.toFixed(2)}</td>
                      <td className="p-1">{order.profitLoss ? <span className={order.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>{order.profitLoss >= 0 ? '+' : '-'}${Math.abs(order.profitLoss).toFixed(2)}</span> : 'N/A'}</td>
                      <td className="p-1">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .stars::before { animation: twinkle 8s infinite linear; opacity: 0.2; }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default TradingPage;