
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, rtdb } from './firebase';
import { ref, get, set, update } from 'firebase/database';
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
const BASE_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', isToken: false },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', isToken: false },
  { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', isToken: false },
  { id: 'solana', symbol: 'SOL', name: 'Solana', isToken: false },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple', isToken: false },
];
const CACHE_DURATION = 30000;
const PRICE_TOLERANCE = 0.05; // ±5% tolerance for token price after initial purchase
const INITIAL_BALANCE = 1000; // Default initial balance
const MIN_PRICE = 0.00000001; // Minimum price to prevent negative values

const TradingPage = ({ updateBalance = () => {} }) => {
  const [userEmail, setUserEmail] = useState('');
  const [mainBalance, setMainBalance] = useState(0);
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
  const [listedTokens, setListedTokens] = useState([]);

  const priceCache = useMemo(() => new Map(), []);
  const chartDataCache = useMemo(() => new Map(), []);

  console.log('Rendering TradingPage, selectedCoin:', selectedCoin, 'listedTokens:', listedTokens);

  const COINS = useMemo(() => {
    const coins = [
      ...BASE_COINS,
      ...listedTokens.map(token => ({
        id: token.id,
        symbol: token.randomToken,
        name: token.name,
        totalSupply: token.totalSupply,
        isToken: true,
      })),
    ];
    console.log('COINS:', coins);
    return coins;
  }, [listedTokens]);

  const generateMockPriceData = () => ({
    bitcoin: 60000,
    ethereum: 3000,
    binancecoin: 500,
    solana: 150,
    ripple: 0.5,
    ...Object.fromEntries(listedTokens.map(token => [token.id, token.currentPrice || token.initialPrice || 1])),
  });

  const generateMockChartData = (initialPrice = 1) => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const timestamp = now - i * 60 * 60 * 1000;
      const price = Math.max(MIN_PRICE, initialPrice + (Math.random() - 0.5) * initialPrice * 0.1);
      data.push({
        date: timestamp,
        open: price,
        high: price * 1.05,
        low: Math.max(MIN_PRICE, price * 0.95),
        close: price,
        volume: Math.random() * 100,
      });
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

  const fetchListedTokens = useCallback(async () => {
    try {
      console.log('Fetching listed tokens...');
      const tokensRef = ref(rtdb, 'ListedTokens');
      const snapshot = await get(tokensRef);
      const tokens = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const tokenData = childSnapshot.val();
          if (tokenData.name && tokenData.randomToken && tokenData.supply) {
            tokens.push({
              id: childSnapshot.key,
              name: tokenData.name,
              symbol: tokenData.randomToken,
              totalSupply: tokenData.supply,
              initialPrice: tokenData.initialPrice || null,
              currentPrice: tokenData.currentPrice || tokenData.initialPrice || 1,
              createdAt: tokenData.createdAt,
              userId: tokenData.userId,
              randomToken: tokenData.randomToken,
              purchasedAmount: tokenData.purchasedAmount || 0,
              chart: tokenData.chart || [],
            });
          }
        });
      }
      setListedTokens(tokens);
      console.log('Listed tokens:', tokens);
    } catch (error) {
      console.error('Error fetching listed tokens:', error.message);
      showAlert('error', 'خطای توکن‌ها', 'خطا در گرفتن توکن‌ها: ' + error.message);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      console.log('Fetching user data for:', user.uid);
      setUserEmail(user.email || 'unknown@example.com');
      try {
        const balanceRef = ref(rtdb, `users/${user.uid}/balance`);
        const snapshot = await get(balanceRef);
        let balance = snapshot.exists() ? snapshot.val() : null;
        if (balance === null || isNaN(balance)) {
          console.log('No balance found, setting to INITIAL_BALANCE:', INITIAL_BALANCE);
          balance = INITIAL_BALANCE;
          await set(balanceRef, balance);
        }
        setMainBalance(balance);
        updateBalance(balance);
        console.log('User balance:', balance);
      } catch (err) {
        console.error('Error fetching balance:', err.message);
        setMainBalance(INITIAL_BALANCE);
        updateBalance(INITIAL_BALANCE);
        await set(ref(rtdb, `users/${user.uid}/balance`), INITIAL_BALANCE);
        showAlert('error', 'خطای بالانس', 'بالانس روی مقدار اولیه تنظیم شد.');
      }
    } else {
      console.log('No user logged in');
      showAlert('error', 'نیاز به ورود', 'لطفاً به حساب کاربری خود وارد شوید.');
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
      const ids = BASE_COINS.map(coin => coin.id).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, { timeout: 5000 });
      const data = await response.json();
      const prices = {
        ...Object.fromEntries(BASE_COINS.map(coin => [coin.id, data[coin.id]?.usd || 0])),
        ...Object.fromEntries(listedTokens.map(token => [token.id, Math.max(MIN_PRICE, token.currentPrice || token.initialPrice || 1)])),
      };
      priceCache.set('prices', prices);
      priceCache.set('timestamp', now);
      setCurrentPrices(prices);
      console.log('Updated prices:', prices);
    } catch (err) {
      console.error('Error fetching prices:', err.message);
      const mockPrices = generateMockPriceData();
      priceCache.set('prices', mockPrices);
      priceCache.set('timestamp', now);
      setCurrentPrices(mockPrices);
    } finally {
      setLoading(false);
    }
  }, [priceCache, listedTokens]);

  const updateTokenChart = async (tokenId, buyPrice, quantity, isFirstPurchase = false) => {
    try {
      console.log('Updating token chart:', { tokenId, buyPrice, quantity, isFirstPurchase });
      if (!tokenId || isNaN(buyPrice) || buyPrice <= 0 || isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid tokenId, buyPrice, or quantity');
      }
      const tokenRef = ref(rtdb, `ListedTokens/${tokenId}`);
      const snapshot = await get(tokenRef);
      if (!snapshot.exists()) {
        throw new Error(`Token ${tokenId} does not exist`);
      }
      const tokenData = snapshot.val();
      const initialPrice = tokenData.initialPrice || 1;
      const totalSupply = tokenData.totalSupply || 1;
      if (isNaN(initialPrice) || initialPrice <= 0 || isNaN(totalSupply) || totalSupply <= 0) {
        throw new Error(`Invalid token data: initialPrice=${initialPrice}, totalSupply=${totalSupply}`);
      }
      let chart = tokenData.chart || [];
      const now = Date.now();
      const openPrice = Math.max(MIN_PRICE, isFirstPurchase ? buyPrice : (initialPrice / totalSupply));
      const fluctuation = (Math.random() - 0.5) * 0.04; // ±2%
      const closePrice = Math.max(MIN_PRICE, openPrice * (1 + fluctuation));
      const highPrice = Math.max(MIN_PRICE, Math.max(openPrice, closePrice) * 1.02);
      const lowPrice = Math.max(MIN_PRICE, Math.min(openPrice, closePrice) * 0.98);
      const newCandle = {
        date: now,
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        volume: quantity,
      };
      chart = [...chart, newCandle];
      await update(tokenRef, { chart, currentPrice: closePrice });
      console.log('Chart updated successfully:', { tokenId, newCandle });
      return chart;
    } catch (error) {
      console.error('Error updating token chart:', error.message);
      showAlert('error', 'خطای چارت', `خطا در آپدیت چارت: ${error.message}`);
      return null;
    }
  };

  const fetchChartData = useCallback(async (coin, timeframe) => {
    const cacheKey = `${coin}_${timeframe}`;
    if (chartDataCache.has(cacheKey) && Date.now() - chartDataCache.get(`${cacheKey}_timestamp`) < CACHE_DURATION) {
      setChartData(chartDataCache.get(cacheKey));
      return;
    }

    const isToken = COINS.find(c => c.id === coin)?.isToken;
    if (isToken) {
      try {
        const tokenRef = ref(rtdb, `ListedTokens/${coin}`);
        const snapshot = await get(tokenRef);
        let chart = snapshot.exists() && snapshot.val().chart ? snapshot.val().chart : [];
        if (chart.length === 0) {
          const initialPrice = snapshot.exists() && snapshot.val().initialPrice ? snapshot.val().initialPrice : 1;
          chart = generateMockChartData(initialPrice);
        }
        chartDataCache.set(cacheKey, chart);
        chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
        setChartData(chart);
        console.log('Chart data fetched:', { coin, chart });
      } catch (error) {
        console.error('Error fetching token chart:', error.message);
        const mockData = generateMockChartData();
        chartDataCache.set(cacheKey, mockData);
        chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
        setChartData(mockData);
      }
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
      const chartData = data.map(([timestamp, open, high, low, close]) => ({
        date: timestamp,
        open: Math.max(MIN_PRICE, open),
        high: Math.max(MIN_PRICE, high),
        low: Math.max(MIN_PRICE, low),
        close: Math.max(MIN_PRICE, close),
        volume: Math.random() * 100,
      }));
      chartDataCache.set(cacheKey, chartData);
      chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
      setChartData(chartData);
    } catch (err) {
      console.error('Error fetching chart data:', err.message);
      const mockData = generateMockChartData();
      chartDataCache.set(cacheKey, mockData);
      chartDataCache.set(`${cacheKey}_timestamp`, Date.now());
      setChartData(mockData);
    }
  }, [chartDataCache, COINS]);

  useEffect(() => {
    fetchUserData();
    fetchListedTokens();
  }, [fetchUserData, fetchListedTokens]);

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
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), tradeType: doc.data().tradeType || 'long' }));
      setOrders(newOrders);
      console.log('Open orders:', newOrders);
    }, (err) => {
      console.error('Error fetching orders:', err.message);
      showAlert('error', 'خطای سفارشات', err.message);
    });

    const hq = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid), where('status', 'in', ['closed']));
    const unsubscribeHistory = onSnapshot(hq, (snapshot) => {
      const newHistoryOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), tradeType: doc.data().tradeType || 'long' }));
      setHistoryOrders(newHistoryOrders);
      console.log('History orders:', newHistoryOrders);
    }, (err) => {
      console.error('Error fetching history:', err.message);
      showAlert('error', 'خطای تاریخچه', err.message);
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
            showAlert('success', 'اجرای سفارش', `سفارش لیمیت برای ${order.symbol} اجرا شد.`);
            const token = listedTokens.find(t => t.id === order.coin);
            if (token && token.isToken) {
              const updatedChart = await updateTokenChart(order.coin, bp, order.quantity, false);
              if (!updatedChart) {
                console.error('Failed to update chart for limit order:', order.coin);
              } else {
                chartDataCache.set(`${order.coin}_1h`, updatedChart);
                chartDataCache.set(`${order.coin}_1h_timestamp`, Date.now());
                setChartData(updatedChart);
              }
            }
          }
        }
        if (order.status === 'executed') {
          const { buyPrice, quantity, leverage, takeProfit, stopLoss, tradeType, coin } = order;
          const currentPrice = currentPrices[coin];
          if (takeProfit && currentPrice) {
            const shouldClose = tradeType === 'long' ? currentPrice >= takeProfit : currentPrice <= takeProfit;
            if (shouldClose) {
              const profit = tradeType === 'long' ? (takeProfit - buyPrice) * quantity * leverage : (buyPrice - takeProfit) * quantity * leverage;
              await handleOrderClose(order.id, profit, 'closed', 'سفارش با سود بسته شد.');
            }
          }
          if (stopLoss && currentPrice) {
            const shouldClose = tradeType === 'long' ? currentPrice <= stopLoss : currentPrice >= stopLoss;
            if (shouldClose) {
              const loss = tradeType === 'long' ? (buyPrice - stopLoss) * quantity * leverage : (stopLoss - buyPrice) * quantity * leverage;
              await handleOrderClose(order.id, loss, 'closed', 'سفارش با ضرر بسته شد.', true);
            }
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [orders, currentPrices, mainBalance, listedTokens, chartDataCache]);

  const handleOrderClose = async (orderId, profitLoss, status, message, isLoss = false) => {
    const newBalance = mainBalance + (isLoss ? -profitLoss : profitLoss);
    if (newBalance < 0) {
      setError('موجودی نمی‌تواند منفی باشد.');
      showAlert('error', 'خطای موجودی', 'موجودی نمی‌تواند منفی باشد.');
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, closedAt: new Date().toISOString(), profitLoss });
      await updateUserBalance(newBalance);
      setSuccess(`${message} $${Math.abs(profitLoss).toFixed(2)}`);
      showAlert('success', 'بستن سفارش', `${message} $${Math.abs(profitLoss).toFixed(2)}`);
    } catch (err) {
      console.error('Error closing order:', err.message);
      showAlert('error', 'خطای بستن', err.message);
    }
  };

  const updateUserBalance = async (newBalance) => {
    if (!auth.currentUser) return;
    try {
      await set(ref(rtdb, `users/${auth.currentUser.uid}/balance`), newBalance);
      setMainBalance(newBalance);
      updateBalance(newBalance);
      console.log('Balance updated:', newBalance);
    } catch (err) {
      console.error('Error updating balance:', err.message);
      showAlert('error', 'خطای آپدیت بالانس', err.message);
    }
  };

  const handleInitialPurchase = async (tokenId, amount, buyPrice) => {
    if (!auth.currentUser) {
      setError('لطفاً به حساب کاربری خود وارد شوید.');
      showAlert('error', 'نیاز به ورود', 'لطفاً به حساب کاربری خود وارد شوید.');
      return;
    }
    const amountUSD = parseFloat(amount);
    if (!amountUSD || amountUSD < MIN_AMOUNT_USD) {
      setError(`حداقل مقدار ${MIN_AMOUNT_USD} دلار است.`);
      showAlert('error', 'مقدار نامعتبر', `حداقل مقدار ${MIN_AMOUNT_USD} دلار است.`);
      return;
    }
    if (amountUSD > mainBalance) {
      setError('موجودی کافی نیست.');
      showAlert('error', 'خطای موجودی', 'موجودی کافی نیست.');
      return;
    }
    const bp = parseFloat(buyPrice);
    if (!bp || bp <= 0) {
      setError('قیمت خرید باید معتبر و مثبت باشد.');
      showAlert('error', 'قیمت نامعتبر', 'قیمت خرید باید معتبر و مثبت باشد.');
      return;
    }

    const token = listedTokens.find(t => t.id === tokenId);
    if (!token) {
      setError('توکن انتخاب‌شده یافت نشد.');
      showAlert('error', 'خطای توکن', 'توکن انتخاب‌شده یافت نشد.');
      return;
    }
    if (token.purchasedAmount > 0) {
      setError('این توکن قبلاً فعال شده است.');
      showAlert('error', 'توکن فعال', 'این توکن قبلاً فعال شده است.');
      return;
    }

    const quantity = amountUSD / bp;
    if (quantity > token.totalSupply) {
      setError(`نمی‌توان بیش از عرضه کل (${token.totalSupply} ${token.symbol}) خرید کرد.`);
      showAlert('error', 'خطای عرضه', `نمی‌توان بیش از عرضه کل (${token.totalSupply} ${token.symbol}) خرید کرد.`);
      return;
    }

    try {
      setLoading(true);
      const tokenRef = ref(rtdb, `ListedTokens/${tokenId}`);
      const updateData = {
        purchasedAmount: quantity,
        initialPrice: bp,
        currentPrice: bp,
      };
      await update(tokenRef, updateData);
      const updatedChart = await updateTokenChart(tokenId, bp, quantity, true);
      if (!updatedChart) {
        throw new Error('Failed to update chart');
      }
      await updateUserBalance(mainBalance - amountUSD);
      setSuccess(`توکن ${token.symbol} فعال شد.`);
      showAlert('success', 'فعال‌سازی توکن', `توکن ${token.symbol} فعال شد.`);
      setAmountInUSD('');
      setBuyPrice('');
      fetchListedTokens();
      chartDataCache.set(`${tokenId}_1h`, updatedChart);
      chartDataCache.set(`${tokenId}_1h_timestamp`, Date.now());
      setChartData(updatedChart);
    } catch (err) {
      console.error('Error in initial purchase:', err.message);
      setError('خطا در خرید اولیه: ' + err.message);
      showAlert('error', 'خطای خرید', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!auth.currentUser) {
      setError('لطفاً به حساب کاربری خود وارد شوید.');
      showAlert('error', 'نیاز به ورود', 'لطفاً به حساب کاربری خود وارد شوید.');
      return;
    }
    const amount = parseFloat(amountInUSD);
    if (!amount || amount < MIN_AMOUNT_USD) {
      setError(`حداقل مقدار ${MIN_AMOUNT_USD} دلار است.`);
      showAlert('error', 'مقدار نامعتبر', `حداقل مقدار ${MIN_AMOUNT_USD} دلار است.`);
      return;
    }
    if (leverage < MIN_LEVERAGE || leverage > MAX_LEVERAGE) {
      setError(`اهرم باید بین ${MIN_LEVERAGE}x و ${MAX_LEVERAGE}x باشد.`);
      showAlert('error', 'اهرم نامعتبر', `اهرم باید بین ${MIN_LEVERAGE}x و ${MAX_LEVERAGE}x باشد.`);
      return;
    }
    const actualAmount = amount / leverage;
    if (actualAmount > mainBalance || mainBalance <= 0) {
      setError('موجودی کافی نیست.');
      showAlert('error', 'خطای موجودی', 'موجودی کافی نیست.');
      return;
    }
    const selectedCoinData = COINS.find(c => c.id === selectedCoin);
    if (!selectedCoinData) {
      setError('ارز انتخاب‌شده یافت نشد.');
      showAlert('error', 'خطای ارز', 'ارز انتخاب‌شده یافت نشد.');
      return;
    }
    const isToken = selectedCoinData.isToken;
    let bp = orderType === 'market' ? currentPrices[selectedCoin] : parseFloat(buyPrice);
    if (!bp || bp <= 0) {
      setError('قیمت خرید نامعتبر است.');
      showAlert('error', 'قیمت نامعتبر', 'قیمت خرید باید معتبر و مثبت باشد.');
      return;
    }
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    if (tp && !((tradeType === 'long' && tp > bp) || (tradeType === 'short' && tp < bp))) {
      setError('سود هدف نامعتبر است.');
      showAlert('error', 'سود هدف نامعتبر', 'سود هدف نامعتبر است.');
      return;
    }
    if (sl && !((tradeType === 'long' && sl < bp) || (tradeType === 'short' && sl > bp))) {
      setError('حد ضرر نامعتبر است.');
      showAlert('error', 'حد ضرر نامعتبر', 'حد ضرر نامعتبر است.');
      return;
    }

    let quantity;
    if (isToken) {
      const token = listedTokens.find(t => t.id === selectedCoin);
      if (!token) {
        setError('توکن انتخاب‌شده یافت نشد.');
        showAlert('error', 'خطای توکن', 'توکن انتخاب‌شده یافت نشد.');
        return;
      }
      if (!token.initialPrice || token.initialPrice <= 0 || !token.totalSupply || token.totalSupply <= 0) {
        setError('داده‌های توکن نامعتبر است.');
        showAlert('error', 'خطای توکن', 'داده‌های توکن (قیمت اولیه یا عرضه کل) نامعتبر است.');
        return;
      }
      const calculatedPrice = token.initialPrice / token.totalSupply;
      if (orderType === 'market') {
        bp = Math.max(MIN_PRICE, calculatedPrice);
      } else {
        const minPrice = calculatedPrice * (1 - PRICE_TOLERANCE);
        const maxPrice = calculatedPrice * (1 + PRICE_TOLERANCE);
        if (bp < minPrice || bp > maxPrice) {
          setError(`قیمت خرید باید بین ${minPrice.toFixed(6)} و ${maxPrice.toFixed(6)} دلار باشد.`);
          showAlert('error', 'خطای قیمت', `قیمت خرید باید بین ${minPrice.toFixed(6)} و ${maxPrice.toFixed(6)} دلار باشد.`);
          return;
        }
      }
      quantity = (amount * leverage) / bp;
      if (quantity + (token.purchasedAmount || 0) > token.totalSupply) {
        setError(`نمی‌توان بیش از عرضه کل (${token.totalSupply} ${token.symbol}) خرید کرد.`);
        showAlert('error', 'خطای عرضه', `نمی‌توان بیش از عرضه کل (${token.totalSupply} ${token.symbol}) خرید کرد.`);
        return;
      }
    } else {
      quantity = (amount * leverage) / bp;
    }

    const order = {
      userId: auth.currentUser.uid,
      buyPrice: bp,
      quantity,
      leverage,
      orderType,
      tradeType,
      status: orderType === 'market' ? 'executed' : 'pending',
      coin: selectedCoin,
      symbol: selectedCoinData.symbol || 'UNKNOWN',
      amountInUSD: amount,
      takeProfit: tp,
      stopLoss: sl,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      if (isToken) {
        const tokenRef = ref(rtdb, `ListedTokens/${selectedCoin}`);
        const token = listedTokens.find(t => t.id === selectedCoin);
        const updateData = {
          purchasedAmount: (token.purchasedAmount || 0) + quantity,
          currentPrice: Math.max(MIN_PRICE, token.initialPrice / token.totalSupply),
        };
        await update(tokenRef, updateData);
        if (orderType === 'market') {
          const updatedChart = await updateTokenChart(selectedCoin, bp, quantity, false);
          if (!updatedChart) {
            throw new Error('Failed to update chart');
          }
          chartDataCache.set(`${selectedCoin}_1h`, updatedChart);
          chartDataCache.set(`${selectedCoin}_1h_timestamp`, Date.now());
          setChartData(updatedChart);
        }
      }
      await updateUserBalance(mainBalance - actualAmount);
      const docRef = await addDoc(collection(db, 'orders'), order);
      setOrderStatus({ ...order, id: docRef.id });
      setSuccess(`سفارش ${orderType === 'market' ? 'اجرا' : 'ثبت'} شد.`);
      showAlert('success', 'موفقیت سفارش', `سفارش برای ${order.symbol} ${orderType === 'market' ? 'اجرا' : 'ثبت'} شد.`);
      setAmountInUSD('');
      setTakeProfit('');
      setStopLoss('');
      setLeverage(1);
      setBuyPrice('');
    } catch (err) {
      console.error('Error in handleBuy:', err.message);
      setError('خطا در ثبت سفارش: ' + err.message);
      showAlert('error', 'خطای سفارش', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOrder = async (orderId, coin, buyPrice, quantity, leverage, tradeType, symbol) => {
    const currentPrice = currentPrices[coin];
    if (!currentPrice) {
      setError('قیمت فعلی در دسترس نیست.');
      showAlert('error', 'خطای قیمت', 'قیمت فعلی در دسترس نیست.');
      return;
    }
    const profitLoss = tradeType === 'long' ? (currentPrice - buyPrice) * quantity * leverage : (buyPrice - currentPrice) * quantity * leverage;
    const isLoss = profitLoss < 0;
    const newBalance = mainBalance + (isLoss ? -profitLoss : profitLoss);
    if (newBalance < 0) {
      setError('موجودی نمی‌تواند منفی باشد.');
      showAlert('error', 'خطای موجودی', 'موجودی نمی‌تواند منفی باشد.');
      return;
    }
    try {
      const isToken = COINS.find(c => c.id === coin)?.isToken;
      if (isToken && tradeType === 'long') {
        const tokenRef = ref(rtdb, `ListedTokens/${coin}`);
        const snapshot = await get(tokenRef);
        if (snapshot.exists()) {
          const purchasedAmount = snapshot.val().purchasedAmount || 0;
          await update(tokenRef, { purchasedAmount: Math.max(0, purchasedAmount - quantity) });
        }
      }
      await handleOrderClose(orderId, profitLoss, 'closed', `سفارش ${symbol} بسته شد.`, isLoss);
    } catch (err) {
      console.error('Error closing order:', err.message);
      showAlert('error', 'خطای بستن', err.message);
    }
  };

  const sortOrders = (orders) => [...orders].sort((a, b) => (sortOrder === 'desc' ? (a[sortBy] > b[sortBy] ? -1 : 1) : (a[sortBy] < b[sortBy] ? -1 : 1)));

  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-vazirmatn relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-3 sm:px-4 relative z-10">
        {isAuthLoaded && !auth.currentUser && <div className="text-center text-red-500 mb-3 font-vazirmatn">لطفاً به حساب کاربری خود وارد شوید.</div>}
        <h1 className="text-xl sm:text-2xl font-bold text-white font-vazirmatn text-center mb-3 sm:mb-4 animate-fadeIn">
          داشبورد تریدینگ
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
            handleInitialPurchase={handleInitialPurchase}
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
            listedTokens={listedTokens}
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
              <FaExchangeAlt className="mr-1" /> سفارشات باز
            </h2>
            <div className="space-y-2">
              {sortOrders(orders).map((order) => (
                <div key={order.id} className="bg-[#f0f8ff05] p-2 rounded-md border border-gray-600 border-opacity-50 hover:bg-[#f0f8ff10] transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">ارز: <span className="font-semibold">{order.symbol}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">نوع: <span className="font-semibold">{order.tradeType === 'long' ? 'لانگ' : 'شورت'}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">سفارش: <span className="font-semibold">{order.orderType}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">اهرم: <span className="font-semibold">{order.leverage}x</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">وضعیت: <span className="font-semibold">{order.status}</span></p>
                      <p className="text-xs sm:text-sm text-gray-200 font-vazirmatn">قیمت: <span className="font-semibold">${order.buyPrice.toFixed(2)}</span></p>
                    </div>
                    <button
                      onClick={() => handleCloseOrder(order.id, order.coin, order.buyPrice, order.quantity, order.leverage, order.tradeType, order.symbol)}
                      className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"
                    >
                      <FaTimesCircle className="inline mr-1" /> بستن
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
              <FaHistory className="mr-1" /> تاریخچه سفارشات
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-gray-200 font-vazirmatn">
                <thead>
                  <tr className="bg-[#f0f8ff05]">
                    <th className="p-1 text-left">ارز</th>
                    <th className="p-1 text-left">نوع</th>
                    <th className="p-1 text-left">سفارش</th>
                    <th className="p-1 text-left">اهرم</th>
                    <th className="p-1 text-left">وضعیت</th>
                    <th className="p-1 text-left">قیمت</th>
                    <th className="p-1 text-left">مقدار</th>
                    <th className="p-1 text-left">مبلغ</th>
                    <th className="p-1 text-left">سود/زیان</th>
                    <th className="p-1 text-left">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortOrders(historyOrders).map((order) => (
                    <tr key={order.id} className="border-b border-gray-600 border-opacity-50 hover:bg-[#f0f8ff10] transition-all duration-300">
                      <td className="p-1">{order.symbol}</td>
                      <td className="p-1">{order.tradeType === 'long' ? 'لانگ' : 'شورت'}</td>
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
