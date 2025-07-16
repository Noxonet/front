import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgFinancialCharts } from 'ag-charts-react';
import { Modal, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FaCog, FaExpand, FaCompress } from 'react-icons/fa';
import 'ag-charts-enterprise';

// Memoized Settings Modal Content
const SettingsModalContent = React.memo(({ chartBackground, setChartBackground, upCandleColor, setUpCandleColor, downCandleColor, setDownCandleColor, onClose }) => (
  <Box
    sx={{
      bgcolor: '#1E3A8A',
      borderRadius: '8px',
      p: 3,
      width: { xs: '90%', sm: 350 },
      maxWidth: '90vw',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
    }}
  >
    <Typography
      id="chart-settings-modal"
      variant="h6"
      sx={{ color: '#fff', fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}
    >
      Chart Settings
    </Typography>
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1 font-vazirmatn">
          Chart Background
        </label>
        <input
          type="color"
          value={chartBackground}
          onChange={(e) => setChartBackground(e.target.value)}
          className="w-full h-9 rounded-md cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1 font-vazirmatn">
          Up Candle Color
        </label>
        <input
          type="color"
          value={upCandleColor}
          onChange={(e) => setUpCandleColor(e.target.value)}
          className="w-full h-9 rounded-md cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1 font-vazirmatn">
          Down Candle Color
        </label>
        <input
          type="color"
          value={downCandleColor}
          onChange={(e) => setDownCandleColor(e.target.value)}
          className="w-full h-9 rounded-md cursor-pointer"
        />
      </div>
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white py-1.5 rounded-md hover:shadow-[0_0_10px_rgba(30,58,138,0.5)] transition-all duration-300 text-sm font-vazirmatn"
      >
        Close
      </button>
    </div>
  </Box>
));

const PriceChart = ({ selectedCoin, currentPrices, chartData, orderStatus, takeProfit, stopLoss, tradeType, generateMockChartData, COINS, fetchChartData }) => {
  const chartContainerRef = useRef(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [priceColor, setPriceColor] = useState('text-white');
  const [openSettings, setOpenSettings] = useState(false);
  const [chartBackground, setChartBackground] = useState('#1A202C');
  const [upCandleColor, setUpCandleColor] = useState('#10B981');
  const [downCandleColor, setDownCandleColor] = useState('#EF4444');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userAnnotations, setUserAnnotations] = useState([]);
  const [timeframe, setTimeframe] = useState('1h'); // Default timeframe

  // Memoized symbol
  const symbol = useMemo(() => COINS.find((c) => c.id === selectedCoin)?.symbol || 'BTC', [COINS, selectedCoin]);

  // Memoized current price
  const currentPrice = useMemo(() => currentPrices[selectedCoin], [currentPrices, selectedCoin]);

  // Track price changes with debouncing
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (currentPrice && prevPrice !== null) {
        setPriceColor(currentPrice > prevPrice ? 'text-green-500' : currentPrice < prevPrice ? 'text-red-500' : 'text-white');
      }
      setPrevPrice(currentPrice);
    }, 200);
    return () => clearTimeout(debounce);
  }, [currentPrice, prevPrice]);

  // Fetch chart data when timeframe changes
  useEffect(() => {
    if (fetchChartData) {
      fetchChartData(selectedCoin, timeframe);
    }
  }, [fetchChartData, selectedCoin, timeframe]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!chartContainerRef.current) return;
    if (!document.fullscreenElement) {
      chartContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error('Fullscreen error:', err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error('Exit fullscreen error:', err));
    }
  }, []);

  // Adjust chart height in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Memoized chart options with timeframe-based tick intervals
  const chartOptions = useMemo(() => {
    const now = Date.now();
    const defaultAnnotations = [
      {
        type: 'horizontal-line',
        y: currentPrice || 0,
        label: { text: 'Current Price', enabled: true, position: 'start', background: '#1E3A8A', color: '#fff', fontFamily: 'Vazirmatn, sans-serif' },
      },
      {
        type: 'line',
        start: { x: { __type: 'date', value: now - 24 * 60 * 60 * 1000 }, y: chartData.length > 1 ? chartData[chartData.length - 2]?.close || 0 : 0 },
        end: { x: { __type: 'date', value: now }, y: currentPrice || 0 },
        stroke: '#3B82F6',
      },
      ...(orderStatus && takeProfit && orderStatus.coin === selectedCoin
        ? [{ type: 'horizontal-line', y: parseFloat(takeProfit) || 0, label: { text: 'Take Profit', enabled: true, position: 'start', background: '#10B981', color: '#fff', fontFamily: 'Vazirmatn, sans-serif' } }]
        : []),
      ...(orderStatus && stopLoss && orderStatus.coin === selectedCoin
        ? [{ type: 'horizontal-line', y: parseFloat(stopLoss) || 0, label: { text: 'Stop Loss', enabled: true, position: 'start', background: '#EF4444', color: '#fff', fontFamily: 'Vazirmatn, sans-serif' } }]
        : []),
    ];

    const combinedAnnotations = [...defaultAnnotations, ...userAnnotations];

    // Define tick intervals based on timeframe
    const timeframeIntervals = {
      '1m': { interval: { unit: 'minute', interval: 1 }, nice: true },
      '2m': { interval: { unit: 'minute', interval: 2 }, nice: true },
      '5m': { interval: { unit: 'minute', interval: 5 }, nice: true },
      '15m': { interval: { unit: 'minute', interval: 15 }, nice: true },
      '1h': { interval: { unit: 'hour', interval: 1 }, nice: true },
      '2h': { interval: { unit: 'hour', interval: 2 }, nice: true },
      '4h': { interval: { unit: 'hour', interval: 4 }, nice: true },
      '1d': { interval: { unit: 'day', interval: 1 }, nice: true },
      '1w': { interval: { unit: 'week', interval: 1 }, nice: true },
    };

    const timeAxisConfig = timeframeIntervals[timeframe] || timeframeIntervals['1h'];

    return {
      series: [
        {
          type: 'candlestick',
          xKey: 'date',
          openKey: 'open',
          highKey: 'high',
          lowKey: 'low',
          closeKey: 'close',
          item: {
            up: { fill: upCandleColor, stroke: upCandleColor },
            down: { fill: downCandleColor, stroke: downCandleColor },
          },
        },
      ],
      data: chartData.length > 0 ? chartData : generateMockChartData(),
      theme: {
        baseTheme: 'ag-financial-dark',
        overrides: {
          common: {
            background: { fill: chartBackground },
            annotations: {
              line: { stroke: '#3B82F6', strokeWidth: 1.5 },
              'horizontal-line': { stroke: '#1E3A8A', strokeWidth: 1.5 },
              text: { color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', fontSize: 10 },
            },
          },
        },
      },
      initialState: { annotations: combinedAnnotations },
      toolbar: {
        enabled: true,
        annotations: { enabled: true },
        zoom: { enabled: true },
        fullscreen: { enabled: true },
      },
      zoom: {
        enabled: true,
        enableAxisDragging: true,
        enablePanning: true,
        panKey: 'none',
        scrolling: { wheel: { enabled: true, zoomFactor: 0.1 } },
        enablePinchZoom: true,
      },
      axes: [
        {
          type: 'time',
          position: 'bottom',
          gridLine: { style: [{ stroke: '#4B5563', lineDash: [2, 2] }] },
          label: { color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif' },
          tick: timeAxisConfig,
        },
        {
          type: 'number',
          position: 'left',
          gridLine: { style: [{ stroke: '#4B5563', lineDash: [2, 2] }] },
          label: { color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', formatter: (params) => `$${params.value.toFixed(2)}` },
        },
      ],
      height: isFullscreen ? '90vh' : 350,
      title: { text: `${symbol}/USD`, fontFamily: 'Vazirmatn, sans-serif', color: '#D1D5DB' },
      onAnnotationChange: (event) => setUserAnnotations(event.annotations.filter(a => !defaultAnnotations.some(da => da.type === a.type && da.y === a.y))),
    };
  }, [chartData, chartBackground, upCandleColor, downCandleColor, currentPrice, selectedCoin, orderStatus, takeProfit, stopLoss, generateMockChartData, isFullscreen, userAnnotations, timeframe]);

  // Handle settings modal close
  const handleCloseSettings = useCallback(() => setOpenSettings(false), []);

  return (
    <div className="bg-[#f0f8ff17] backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-300 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] lg:col-span-2 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base sm:text-lg font-semibold text-white font-vazirmatn">
          Price Chart ({symbol}/USD)
        </h2>
        <div className="flex items-center gap-2">
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel sx={{ color: '#D1D5DB', fontFamily: 'Vazirmatn, sans-serif', '&.Mui-focused': { color: '#3B82F6' } }}>
              Timeframe
            </InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              sx={{
                backgroundColor: '#f0f8ff17',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'Vazirmatn, sans-serif',
                height: '36px',
                '& .MuiSvgIcon-root': { color: '#D1D5DB' },
                '&:hover': { boxShadow: '0 0 10px rgba(30, 58, 138, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
              }}
            >
              <MenuItem value="1m">1m</MenuItem>
              <MenuItem value="2m">2m</MenuItem>
              <MenuItem value="5m">5m</MenuItem>
              <MenuItem value="15m">15m</MenuItem>
              <MenuItem value="1h">1h</MenuItem>
              <MenuItem value="2h">2h</MenuItem>
              <MenuItem value="4h">4h</MenuItem>
              <MenuItem value="1d">1d</MenuItem>
              <MenuItem value="1w">1w</MenuItem>
            </Select>
          </FormControl>
          <div className={`text-base sm:text-lg font-semibold ${priceColor} font-vazirmatn transition-colors duration-300`}>
            {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Loading...'}
          </div>
          <button
            onClick={() => setOpenSettings(true)}
            className="text-white hover:text-blue-400 transition-colors duration-200"
            title="Chart Settings"
          >
            <FaCog size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors duration-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} style={{ height: isFullscreen ? '90vh' : 'auto' }}>
        <AgFinancialCharts options={chartOptions} />
      </div>
      {openSettings && (
        <Modal
          open={openSettings}
          onClose={handleCloseSettings}
          aria-labelledby="chart-settings-modal"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <SettingsModalContent
            chartBackground={chartBackground}
            setChartBackground={setChartBackground}
            upCandleColor={upCandleColor}
            setUpCandleColor={setUpCandleColor}
            downCandleColor={downCandleColor}
            setDownCandleColor={setDownCandleColor}
            onClose={handleCloseSettings}
          />
        </Modal>
      )}
    </div>
  );
};

export default React.memo(PriceChart);