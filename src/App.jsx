import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { Menu, LogOut, X, Wallet } from 'lucide-react';
import { auth } from './firebase';
import DepositPage from './Deposit';
import AssetsPage from './Asset';
import WithdrawPage from './Withdraw';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import TasksPage from './TasksPage ';
import ProfilePage from './ProfilePage';
import TradePage from './TradePage';
import PropPurchase from './PropPurchase';
import BotActivationPage from './BotsPage';
import { fetchWithErrorHandling } from './fetchHelper';
import { MdAssessment, MdOutlineAccountBox } from 'react-icons/md';
import { RiFundsFill } from 'react-icons/ri';
import { LuHeadset } from 'react-icons/lu';
import { IoMdChatboxes } from 'react-icons/io';
import { IoDocuments } from 'react-icons/io5';
import { GrDocumentText } from 'react-icons/gr';

function LandingPage() {
    return (
      <div className="overflow-x-hidden overflow-y-auto w-full bg-gray-900 text-white">
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-1 flex-col">
            <div className="relative bg-gray-800" style={{
              background: 'url(./public/12319936_SL-011719-17920-65.jpg)',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}>
              <div className="flex mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px", minHeight: "300px", paddingTop: "60px", paddingBottom: "60px" }}>
                <div className="flex flex-col justify-center items-start">
                  <div style={{ maxWidth: "560px" }}>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-snug md:leading-[56px] mb-2 sm:mb-4">
                      Quantum: Your Gateway into Web3
                    </div>
                    <div className="mt-2 text-sm sm:text-base text-gray-300">
                      Trading in cryptoassets involves a high degree of risk and may not be suitable for all investors. The value of cryptoassets can be extremely volatile and unpredictable, and can fluctuate significantly in a short period of time. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before trading in cryptoassets. Always trade responsibly and never invest more than you can afford to lose.
                    </div>
                    <div className="mt-6 sm:mt-8">
                      <Link to="/tasks" className="inline-flex items-center justify-center cursor-pointer text-sm sm:text-base font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Claim Reward
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div style={{ backgroundColor: "#1f2937", fontSize: "14px", lineHeight: "21px", padding: "24px 0" }}>
              <div className="mx-auto px-4 sm:px-6 border border-yellow-500 py-6 sm:py-8 bg-yellow-900/20 rounded-xl" style={{ maxWidth: "1248px" }}>
                <div className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  <strong className="block font-bold">
                    ⚠️ Important Notice: Advanced Trading Platform
                  </strong>
                  <div className="text-gray-300 mt-2">
                    Quantum Exchange offers advanced trading features designed for experienced traders. Our platform provides access to spot trading, futures, and advanced order types. Please ensure you understand the risks involved before using leverage or derivative products.
                  </div>
                </div>
              </div>
            </div>
  
            <div style={{ backgroundColor: "#1f2937", padding: "40px 0" }}>
              <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="mb-8 sm:mb-12">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                        Get Started
                      </div>
                    </div>
                    <div>
                      {[
                        { icon: <MdOutlineAccountBox className="text-5xl sm:text-6xl md:text-7xl text-gray-300" />, title: "Step 1: Create & Verify Account", desc: "Sign up for your Quantum account and complete identity verification to access all trading features and ensure platform security." },
                        { icon: <MdAssessment className="text-5xl sm:text-6xl md:text-7xl text-gray-300" />, title: "Step 2: Complete Trading Assessment", desc: "Take our trading knowledge assessment to unlock advanced features and ensure you understand the risks of cryptocurrency trading." },
                        { icon: <RiFundsFill className="text-5xl sm:text-6xl md:text-7xl text-gray-300" />, title: "Step 3: Fund & Start Trading", desc: "Deposit funds using multiple payment methods and start trading with advanced order types, leverage, and professional tools." },
                      ].map((step, index) => (
                        <div key={index} className="flex mb-8 sm:mb-12">
                          <div className="flex items-start justify-center">
                            {step.icon}
                          </div>
                          <div className="flex-1 ml-4 sm:ml-6">
                            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">{step.title}</div>
                            <div className="text-sm sm:text-base text-gray-300">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center order-2 my-6 md:my-0">
                    <img src="./public/AdobeStock_1531277087_Preview.jpeg" className="rounded-2xl shadow-xl max-w-full h-auto" loading="lazy" alt="phone chart" />
                  </div>
                </div>
              </div>
            </div>
  
            <div style={{ backgroundColor: "#1f2937", padding: "24px 0" }}>
              <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
                <div className="flex flex-col md:flex-row gap-6">
                  {[
                    { title: "24/7 Live Support", desc: "Get instant help from our expert support team available around the clock for all your trading needs.", icon: <LuHeadset className="text-5xl sm:text-6xl md:text-7xl text-gray-300" /> },
                    { title: "Trading Guides", desc: "Access comprehensive guides and tutorials to master cryptocurrency trading strategies.", icon: <IoMdChatboxes className="text-5xl sm:text-6xl md:text-7xl text-gray-300" /> },
                    { title: "Market News", desc: "Stay updated with the latest cryptocurrency market news, analysis, and insights from industry experts.", icon: <IoDocuments className="text-5xl sm:text-6xl md:text-7xl text-gray-300" /> },
                    { title: "API Documentation", desc: "Integrate with our powerful API for algorithmic trading, portfolio management, and custom applications.", icon: <GrDocumentText className="text-5xl sm:text-6xl md:text-7xl text-gray-300" /> },
                  ].map((card, index) => (
                    <Link key={index} to="#" className="flex flex-col p-4 rounded-lg hover:bg-gray-800 transition-colors" style={{ textDecoration: "none", color: "inherit" }}>
                      {card.icon}
                      <div className="mt-4">
                        <div className="font-medium text-white text-sm sm:text-base">{card.title}</div>
                        <div className="text-gray-300 text-xs sm:text-sm mt-2">{card.desc}</div>
                      </div>
                      <button className="mt-6 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        {card.title === "24/7 Live Support" ? "Contact Support" : card.title === "Trading Guides" ? "Learn More" : card.title === "Market News" ? "Read News" : "View Docs"}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
}

function Earn() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Earn</h2>
          <p className="text-sm text-gray-300 mb-4">Stake your assets to earn passive income or participate in yield farming.</p>
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Earning Options</h3>
            <p className="text-sm text-gray-300">This feature is under development. Stay tuned for staking and farming opportunities.</p>
          </div>
        </div>
      </div>
    );
}

function Futures() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Futures</h2>
          <p className="text-sm text-gray-300 mb-4">Trade futures contracts with leverage to maximize your trading potential.</p>
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Futures Trading</h3>
            <p className="text-sm text-gray-300">This feature is under development. Check back later for futures trading options.</p>
          </div>
        </div>
      </div>
    );
}

function Spot() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Spot</h2>
          <p className="text-sm text-gray-300 mb-4">Trade cryptocurrencies directly on our spot market with low fees.</p>
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Spot Trading</h3>
            <p className="text-sm text-gray-300">This feature is under development. Stay tuned for spot trading capabilities.</p>
          </div>
        </div>
      </div>
    );
}

function NotAvailable() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full text-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Sorry</h2>
          <p className="text-sm text-gray-300 mb-4">We can't provide this page right now</p>
        </div>
      </div>
    );
}

function NotFound() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full text-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Not found</h2>
          <p className="text-sm text-gray-300 mb-4">There is no route matching the URL</p>
        </div>
      </div>
    );
}

function Support() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Support</h2>
          <p className="text-sm text-gray-300 mb-4">Get help with your account or trading issues from our support team.</p>
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Contact Support</h3>
            <p className="text-sm text-gray-300">Reach out to our 24/7 support team via email: support@quantumexchange.com</p>
            <button
              onClick={() => Swal.fire({
                icon: 'info',
                title: 'Support',
                text: 'Email us at support@quantumexchange.com for assistance.',
                confirmButtonColor: '#2563eb',
                confirmButtonText: '<span class="text-white">Ok</span>',
              })}
              className="mt-4 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Contact Now
            </button>
          </div>
        </div>
      </div>
    );
}

function Drawer({ isOpen, toggleDrawer, isLoggedIn, handleLogout }) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={toggleDrawer}
          />
        )}
        <div 
          className={`fixed top-0 left-0 h-full w-full bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <img src="./public/22072203_6549945.jpg" className="h-10" alt="logo" />
              <button onClick={toggleDrawer} className="p-2">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col p-4 space-y-2">
              {[
                { to: "/support", label: "Support" },
                { to: "/Earn", label: "Earn" },
                { to: "/Futures", label: "Futures" },
                { to: "/Spot", label: "Spot" },
                { to: "/assets", label: "Assets" },
                { to: "/tasks", label: "Tasks" },
                { to: "/withdraw", label: "Withdraw" },
                { to: "/trade", label: "Trade" },
                { to: "/prop", label: "Prop" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors"
                  onClick={toggleDrawer}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
              {isLoggedIn ? (
                <button 
                  onClick={() => { handleLogout(); toggleDrawer(); }} 
                  className="block text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors mb-2"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors mb-2"
                    onClick={toggleDrawer}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block bg-blue-600 text-white text-base font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-center"
                    onClick={toggleDrawer}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  const updateBalance = async () => {
    if (!auth.currentUser) return;
    try {
      const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
      if (userData && userData.balance !== undefined) {
        setBalance(userData.balance);
        setIsLoggedIn(true);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error updating balance:', error.message);
      if (error.message.includes('User data not found') || error.message.includes('Unauthorized')) {
        await signOut(auth);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setBalance(0);
        navigate('/signup');
      }
    }
  };

  const retryFetchUserData = async (uid, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const userData = await fetchWithErrorHandling('GET', `users/${uid}`);
        if (userData) {
          return userData;
        }
        throw new Error('User data not found');
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await retryFetchUserData(user.uid);
          setIsLoggedIn(true);
          setBalance(userData.balance || 0);
        } catch (error) {
          console.error('Auth state error:', error.message);
          if (error.message.includes('User data not found')) {
            navigate('/signup');
          } else if (error.message.includes('Unauthorized')) {
            await signOut(auth);
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setBalance(0);
            navigate('/login');
          }
        }
      } else {
        setIsLoggedIn(false);
        setBalance(0);
        localStorage.removeItem('token');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setBalance(0);
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        timer: 1000,
        customClass: {
          popup: 'bg-gray-900 shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors',
        },
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Logout Error',
        text: error.message,
        confirmButtonColor: '#2563eb',
        confirmButtonText: '<span class="text-white">OK</span>',
        customClass: {
          popup: 'bg-gray-900 shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="sm:hidden p-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <img src='./public/atomic.png' className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" alt="logo" />
                <span className="text-lg sm:text-xl font-bold">Quantum</span>
              </Link>
            </div>
            <nav className="hidden md:!flex items-center space-x-4 lg:space-x-6">
              {[
                { to: '/support', label: 'Support' },
                { to: '/Earn', label: 'Earn' },
                { to: '/Futures', label: 'Futures' },
                { to: '/Spot', label: 'Spot' },
                { to: '/assets', label: 'Assets' },
                { to: '/tasks', label: 'Tasks' },
                { to: '/withdraw', label: 'Withdraw' },
                { to: '/trade', label: 'Trade' },
                { to: '/prop', label: 'Prop' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-200 hover:text-blue-400'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
                    <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                    <span className="text-xs sm:text-sm font-medium">{balance.toFixed(2)} USDT</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-200 hover:text-blue-400 transition-colors"
                  >
                    <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs sm:text-sm font-medium text-gray-200 hover:text-blue-400 transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-95 z-50 transform transition-transform duration-300 ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          } sm:hidden`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsDrawerOpen(false)}>
              <img src="/assets/logo.png" className="h-8 w-8 rounded-full" alt="logo" />
              <span className="text-lg font-bold">Quantum</span>
            </Link>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-md hover:bg-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-4">
            {[
              { to: '/support', label: 'Support' },
              { to: '/Earn', label: 'Earn' },
              { to: '/Futures', label: 'Futures' },
              { to: '/Spot', label: 'Spot' },
              { to: '/assets', label: 'Assets' },
              { to: '/tasks', label: 'Tasks' },
              { to: '/withdraw', label: 'Withdraw' },
              { to: '/trade', label: 'Trade' },
              { to: '/prop', label: 'Prop' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-200 hover:text-blue-400'
                  }`
                }
                onClick={() => setIsDrawerOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<AssetsPage updateBalance={updateBalance} />} />
          <Route path="/assets" element={<AssetsPage updateBalance={updateBalance} />} />
          <Route path="/deposit" element={<DepositPage updateBalance={updateBalance} />} />
          <Route path="/withdraw" element={<WithdrawPage updateBalance={updateBalance} />} />
          <Route path="/tasks" element={<TasksPage updateBalance={updateBalance} />} />
          <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} setBalance={setBalance} updateBalance={updateBalance} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/support" element={<NotAvailable />} />
          <Route path="/Earn" element={<BotActivationPage />} />
          <Route path="/Futures" element={<NotAvailable />} />
          <Route path="/Spot" element={<NotAvailable />} />
          <Route path="/transfer" element={<NotAvailable />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/prop" element={<PropPurchase />} />
          <Route path="/bots" element={<BotActivationPage />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;