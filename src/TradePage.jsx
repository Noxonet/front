import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import Chart from 'react-apexcharts';

function TradePage() {
  const [balance, setBalance] = useState(0);
  const [propBalance, setPropBalance] = useState(0);
  const [propStatus, setPropStatus] = useState(false);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        try {
          const userData = await fetchWithErrorHandling('GET', `users/${user.uid}`);
          setBalance(userData?.balance || 0);
          setPropBalance(userData?.propBalance || 0);
          setPropStatus(userData?.propStatus || false);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to fetch user data',
            confirmButtonColor: '#1f2937',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-gray-900',
              content: 'text-gray-700 text-sm sm:text-base',
              confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
            },
          });
        }
      }
    });

    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'
        );
        const data = await response.json();
        const prices = data.prices.map(([timestamp, price]) => ({
          x: timestamp,
          y: Math.round(price * 100) / 100,
        }));
        setChartData(prices);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigate]);

  const handleTrade = async () => {
    if (!propStatus) {
      Swal.fire({
        icon: 'error',
        title: 'Trade Error',
        text: 'Prop status is not active. Purchase a prop first.',
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
        },
      });
      navigate('/prop-purchase');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Trade Initiated',
      text: 'Trade has been successfully initiated!',
      confirmButtonColor: '#1f2937',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-gray-900',
        content: 'text-gray-700 text-sm sm:text-base',
        confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors',
      },
    });
  };

  const chartOptions = {
    chart: {
      type: 'area',
      height: 400,
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
          reset: true,
        },
      },
    },
    title: {
      text: 'Bitcoin Price (USD) - Last 30 Days',
      align: 'left',
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#4f46e5'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#a5b4fc'],
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    colors: ['#4f46e5'],
    series: [
      {
        name: 'BTC (USD)',
        data: chartData,
      },
    ],
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM yyyy',
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy',
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
      theme: 'dark',
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Trading Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600">Main Balance</p>
            <p className="text-2xl font-bold text-indigo-600">${balance}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600">Prop Balance</p>
            <p className="text-2xl font-bold text-indigo-600">${propBalance}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600">Prop Status</p>
            <p className="text-2xl font-bold text-indigo-600">{propStatus ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        <button
          onClick={handleTrade}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg mb-8"
        >
          Start Trade
        </button>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <Chart options={chartOptions} series={chartOptions.series} type="area" height={400} />
        </div>
      </div>
    </div>
  );
}

export default TradePage;