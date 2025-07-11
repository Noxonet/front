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
  const [propBalance, setPropBalance] = useState(10000); // Initial balance
  const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // Default: BTC
  const [orderType, setOrderType] = useState('market'); // Market or Limit
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({}); // Real-time prices
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

  // Generate fallback chart data
  const generateMockAreaData = () => {
    const data = [];
    const startTime = new Date('2025-07-01').getTime();
    let price = 50000;
    for (let i = 0; i < 7; i++) {
      const time = startTime + i * 24 * 3600000; // Daily data
      price += (Math.random() - 0.5) * 1000;
      data.push([time, price]);
    }
    return data;
  };

  // Fetch user email and balance from Firestore
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

  // Fetch real-time prices from CoinGecko
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
    const interval = setInterval(fetchPrices, 15000); // Update every 15 seconds to avoid rate limit
    return () => clearInterval(interval);
  }, [selectedCoin, orderType]);

  // Fetch historical chart data for selected coin
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: 7,
              interval: 'daily', // Use daily to avoid 401
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

  // Update price and check TP/SL for Limit Orders
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

  // Update balance in Firestore
  const updateBalance = async (newBalance) => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, { propBalance: newBalance });
      setPropBalance(newBalance);
    }
  };

  // Handle buy order
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

  // Cancel order
  const handleCancelOrder = () => {
    setOrderStatus(null);
    setSuccess('Order canceled.');
    setError('');
  };

  // Area chart options
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
      colors: ['#7F00FF'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#3B0764'],
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: '#D1D5DB', fontFamily: 'Roboto, sans-serif' },
        format: 'dd MMM',
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
        style: { colors: '#D1D5DB', fontFamily: 'Roboto, sans-serif' },
      },
    },
    annotations: {
      yaxis: [
        {
          y: currentPrices[selectedCoin] || 0,
          borderColor: '#7F00FF',
          label: {
            text: 'Current Price',
            style: { color: '#fff', background: '#7F00FF', fontFamily: 'Roboto, sans-serif' },
          },
        },
        orderStatus && takeProfit && orderStatus.coin === selectedCoin
          ? {
              y: parseFloat(takeProfit),
              borderColor: '#4CAF50',
              label: {
                text: 'Take Profit',
                style: { color: '#fff', background: '#4CAF50', fontFamily: 'Roboto, sans-serif' },
              },
            }
          : {},
        orderStatus && stopLoss && orderStatus.coin === selectedCoin
          ? {
              y: parseFloat(stopLoss),
              borderColor: '#F44336',
              label: {
                text: 'Stop Loss',
                style: { color: '#fff', background: '#F44336', fontFamily: 'Roboto, sans-serif' },
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
      style: { fontFamily: 'Roboto, sans-serif' },
    },
  };

  const chartSeries = [
    {
      name: `${coins.find((c) => c.id === selectedCoin)?.symbol}/USD`,
      data: chartData,
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom right, #111827, #1E3A8A, #4C1D95)',
        padding: '20px',
        minHeight: '100vh',
        fontFamily: "'Roboto', sans-serif",
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: '1fr 2fr',
        
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="trading-page !w-full "
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `url('https://www.transparenttextures.com/patterns/stardust.png')`,
          opacity: 0.2,
          animation: 'pulse 10s infinite',
        }}
      ></div>
      <h1
        style={{
          color: '#fff',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '2rem',
          gridColumn: '1 / -1',
          position: 'relative',
          zIndex: 10,
        }}
      >
        Trading Dashboard
      </h1>

      {/* Order Form */}
      <div
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.2)',
          backdropFilter: 'blur(12px)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(126, 0, 255, 0.3)',
          transition: 'box-shadow 0.3s, transform 0.3s',
          border: '1px solid rgba(75, 85, 99, 0.2)',
          position: 'relative',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(126, 0, 255, 0.5)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(126, 0, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.5rem' }}>
          Place Order
        </h2>
        <p style={{ color: '#D1D5DB', marginBottom: '10px', fontWeight: '500' }}>
          User: {userEmail || 'Loading...'}
        </p>
        <p style={{ color: '#D1D5DB', marginBottom: '10px', fontWeight: '500' }}>
          Wallet: {WALLET_ADDRESS}
        </p>
        <p style={{ color: '#D1D5DB', marginBottom: '20px', fontWeight: '500' }}>
          Prop Balance: ${propBalance.toFixed(2)}
        </p>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Select Coin:
          </label>
          <select
            value={selectedCoin}
            onChange={(e) => {
              setSelectedCoin(e.target.value);
              setBuyPrice(orderType === 'market' ? currentPrices[e.target.value]?.toFixed(2) || '' : '');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Order Type:
          </label>
          <select
            value={orderType}
            onChange={(e) => {
              setOrderType(e.target.value);
              setBuyPrice(e.target.value === 'market' ? currentPrices[selectedCoin]?.toFixed(2) || '' : '');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Buy Price ($):
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder={`Current: $${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}`}
            disabled={orderType === 'market'}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: orderType === 'market' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Quantity ({coins.find((c) => c.id === selectedCoin)?.symbol}):
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Example: 0.001"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Take Profit (Optional) ($):
          </label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Example: 51000"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#D1D5DB', marginBottom: '5px', fontWeight: '500' }}>
            Stop Loss (Optional) ($):
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Example: 49000"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7F00FF';
              e.target.style.boxShadow = '0 0 5px rgba(126, 0, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          onClick={handleBuy}
          disabled={orderStatus}
          style={{
            backgroundColor: orderStatus ? 'rgba(75, 85, 99, 0.4)' : 'rgba(126, 0, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(75, 85, 99, 0.2)',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: orderStatus ? 'not-allowed' : 'pointer',
            color: '#fff',
            width: '100%',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
          }}
          onMouseEnter={(e) => !orderStatus && (e.target.style.transform = 'scale(1.05)') && (e.target.style.boxShadow = '0 4px 15px rgba(126, 0, 255, 0.7)')}
          onMouseLeave={(e) => !orderStatus && (e.target.style.transform = 'scale(1)') && (e.target.style.boxShadow = 'none')}
        >
          Place Order
        </button>
        {orderStatus && (
          <button
            onClick={handleCancelOrder}
            style={{
              backgroundColor: 'rgba(244, 67, 54, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#fff',
              width: '100%',
              fontSize: '1rem',
              fontWeight: '500',
              marginTop: '10px',
              transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Cancel Order
          </button>
        )}
        {error && (
          <p style={{ color: '#F44336', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: '#4CAF50', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            {success}
          </p>
        )}
        {orderStatus && (
          <div
            style={{
              marginTop: '20px',
              backgroundColor: 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(12px)',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(126, 0, 255, 0.3)',
              transition: 'box-shadow 0.3s, transform 0.3s',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(126, 0, 255, 0.5)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(126, 0, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>
              Open Order
            </h3>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Coin: <span style={{ fontWeight: '600' }}>{orderStatus.symbol}</span>
            </p>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Order Type: <span style={{ fontWeight: '600' }}>{orderStatus.orderType.toUpperCase()}</span>
            </p>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Status: <span style={{ fontWeight: '600' }}>{orderStatus.status.toUpperCase()}</span>
            </p>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Buy Price: <span style={{ fontWeight: '600' }}>${orderStatus.buyPrice.toFixed(2)}</span>
            </p>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Quantity: <span style={{ fontWeight: '600' }}>{orderStatus.quantity.toFixed(4)} {orderStatus.symbol}</span>
            </p>
            {orderStatus.takeProfit && (
              <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
                Take Profit: <span style={{ fontWeight: '600', color: '#4CAF50' }}>${orderStatus.takeProfit.toFixed(2)}</span>
              </p>
            )}
            {orderStatus.stopLoss && (
              <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
                Stop Loss: <span style={{ fontWeight: '600', color: '#F44336' }}>${orderStatus.stopLoss.toFixed(2)}</span>
              </p>
            )}
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', margin: '5px 0' }}>
              Current Price: <span style={{ fontWeight: '600' }}>${currentPrices[selectedCoin]?.toFixed(2) || 'Loading...'}</span>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div
        style={{
          gridColumn: '2 / 3',
          backgroundColor: 'rgba(17, 24, 39, 0.2)',
          backdropFilter: 'blur(12px)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(126, 0, 255, 0.3)',
          transition: 'box-shadow 0.3s, transform 0.3s',
          border: '1px solid rgba(75, 85, 99, 0.2)',
          position: 'relative',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(126, 0, 255, 0.5)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(126, 0, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.5rem' }}>
          Price Chart ({coins.find((c) => c.id === selectedCoin)?.symbol}/USD)
        </h2>
        <Chart options={chartOptions} series={chartSeries} type="area" height={400} />
      </div>

      {/* Responsive Design and Input Styling */}
      <style>
        {`
          @media (max-width: 768px) {
            .trading-page {
              grid-template-columns: 1fr;
            }
            .trading-page > div {
              grid-column: 1 / -1;
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
          @keyframes pulse {
            0% { opacity: 0.2; }
            50% { opacity: 0.3; }
            100% { opacity: 0.2; }
          }
        `}
      </style>
    </div>
  );
};

export default TradingPage;