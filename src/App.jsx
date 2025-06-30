import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { Menu, LogOut } from 'lucide-react';
import { auth } from './firebase';
import DepositPage from './Deposit';
import AssetsPage from './Asset';
import WithdrawPage from './withdraw';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { fetchWithErrorHandling } from './fetchHelper';
import { MdAssessment, MdOutlineAccountBox } from 'react-icons/md';
import { RiFundsFill } from 'react-icons/ri';
import { LuHeadset } from 'react-icons/lu';
import { IoMdChatboxes } from 'react-icons/io';
import { IoDocuments } from 'react-icons/io5';
import { GrDocumentText } from 'react-icons/gr';

function LandingPage() {
    return (
      <div className="overflow-x-hidden overflow-y-auto w-full bg-white">
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-1 flex-col">
            <div className="text-black relative bg-gray-200" style={{
              background: 'url(./public/12319936_SL-011719-17920-65.jpg)',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}>
              <div className="flex mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px", minHeight: "300px", paddingTop: "60px", paddingBottom: "60px" }}>
                <div className="flex flex-col justify-center items-start">
                  <div style={{ maxWidth: "560px" }}>
                    <div className="text-black text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-snug md:leading-[56px] mb-2 sm:mb-4">
                      Quantum: Your Gateway into Web3
                    </div>
                    <div className="mt-2 text-sm sm:text-base text-gray-600">
                      Trading in cryptoassets involves a high degree of risk and may not be suitable for all investors. The value of cryptoassets can be extremely volatile and unpredictable, and can fluctuate significantly in a short period of time. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before trading in cryptoassets. Always trade responsibly and never invest more than you can afford to lose.
                    </div>
                    <div className="mt-6 sm:mt-8">
                      <Link to="/tasks" className="inline-flex items-center justify-center cursor-pointer text-sm sm:text-base font-medium px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                        Claim Reward
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div style={{ backgroundColor: "#f5f5f5", fontSize: "14px", lineHeight: "21px", padding: "24px 0" }}>
              <div className="mx-auto px-4 sm:px-6 border border-yellow-300 py-6 sm:py-8 bg-yellow-100 rounded-xl" style={{ maxWidth: "1248px" }}>
                <div className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  <strong className="block font-bold text-black">
                    ⚠️ Important Notice: Advanced Trading Platform
                  </strong>
                  <div className="text-gray-600 mt-2">
                    Quantum Exchange offers advanced trading features designed for experienced traders. Our platform provides access to spot trading, futures, and advanced order types. Please ensure you understand the risks involved before using leverage or derivative products.
                  </div>
                </div>
              </div>
            </div>
  
            <div style={{ backgroundColor: "#f5f5f5", padding: "40px 0" }}>
              <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="mb-8 sm:mb-12">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
                        Get Started
                      </div>
                    </div>
                    <div>
                      {[
                        { icon: <MdOutlineAccountBox className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 1: Create & Verify Account", desc: "Sign up for your Quantum account and complete identity verification to access all trading features and ensure platform security." },
                        { icon: <MdAssessment className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 2: Complete Trading Assessment", desc: "Take our trading knowledge assessment to unlock advanced features and ensure you understand the risks of cryptocurrency trading." },
                        { icon: <RiFundsFill className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 3: Fund & Start Trading", desc: "Deposit funds using multiple payment methods and start trading with advanced order types, leverage, and professional tools." },
                      ].map((step, index) => (
                        <div key={index} className="flex mb-8 sm:mb-12">
                          <div className="flex items-start justify-center">
                            {step.icon}
                          </div>
                          <div className="flex-1 ml-4 sm:ml-6">
                            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2">{step.title}</div>
                            <div className="text-sm sm:text-base text-gray-600">{step.desc}</div>
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
  
            <div style={{ backgroundColor: "#f5f5f5", padding: "24px 0" }}>
              <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
                <div className="flex flex-col md:flex-row gap-6">
                  {[
                    { title: "24/7 Live Support", desc: "Get instant help from our expert support team available around the clock for all your trading needs.", icon: <LuHeadset className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
                    { title: "Trading Guides", desc: "Access comprehensive guides and tutorials to master cryptocurrency trading strategies.", icon: <IoMdChatboxes className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
                    { title: "Market News", desc: "Stay updated with the latest cryptocurrency market news, analysis, and insights from industry experts.", icon: <IoDocuments className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
                    { title: "API Documentation", desc: "Integrate with our powerful API for algorithmic trading, portfolio management, and custom applications.", icon: <GrDocumentText className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
                  ].map((card, index) => (
                    <Link key={index} to="#" className="flex flex-col p-4 rounded-lg hover:bg-gray-100 transition-colors" style={{ textDecoration: "none", color: "inherit" }}>
                      {card.icon}
                      <div className="mt-4">
                        <div className="font-medium text-black text-sm sm:text-base">{card.title}</div>
                        <div className="text-gray-600 text-xs sm:text-sm mt-2">{card.desc}</div>
                      </div>
                      <button className="mt-6 bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
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

  import { CheckCircle, Circle, DollarSign } from 'lucide-react';
  
function TasksPage() {
    const [tasks, setTasks] = useState([
      { id: 'signup', title: 'Sign Up Bonus', description: 'Sign up to receive a $5 bonus', reward: 5, status: 'pending' },
      { id: 'firstDeposit', title: 'First Deposit Bonus', description: 'Make your first deposit to receive a $10 bonus', reward: 10, status: 'pending' },
      { id: 'invite', title: 'Invite Friends', description: 'Invite friends to earn $2 per successful referral', reward: 2, count: 0, status: 'pending' },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchUserTasks = async () => {
        if (!auth.currentUser) {
          navigate('/login');
          return;
        }
        try {
          const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
          if (!userData) {
            throw new Error('User data not found');
          }
          setTasks([
            {
              id: 'signup',
              title: 'Sign Up Bonus',
              description: 'Sign up to receive a $5 bonus',
              reward: 5,
              status: userData.hasSignupBonusClaimed ? 'claimed' : userData.hasSignupBonus ? 'completed' : 'pending',
            },
            {
              id: 'firstDeposit',
              title: 'First Deposit Bonus',
              description: 'Make your first deposit to receive a $10 bonus',
              reward: 10,
              status: userData.hasFirstDepositBonusClaimed ? 'claimed' : userData.hasFirstDepositBonus ? 'completed' : 'pending',
            },
            {
              id: 'invite',
              title: 'Invite Friends',
              description: 'Invite friends to earn $2 per successful referral',
              reward: 2,
              count: userData.referralCount || 0,
              status: userData.referralCount > 0 ? 'completed' : 'pending',
            },
          ]);
        } catch (error) {
          let errorMessage = error.message;
          if (error.message.includes('User data not found')) {
            errorMessage = 'User data not found, please sign up';
            navigate('/signup');
          } else if (error.message.includes('Unauthorized')) {
            errorMessage = 'Invalid API secret, please contact support';
            localStorage.removeItem('token');
            auth.signOut();
            navigate('/login');
          }
          Swal.fire({
            icon: 'error',
            title: 'Error Fetching Tasks',
            text: errorMessage,
            confirmButtonColor: '#1f2937',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
              title: 'text-xl font-bold text-gray-900',
              content: 'text-gray-700',
              confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
            },
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserTasks();
    }, [navigate]);
  
    const handleTaskClick = (taskId) => {
      if (taskId === 'firstDeposit' && tasks.find((task) => task.id === 'firstDeposit').status === 'pending') {
        navigate('/deposit');
      } else if (taskId === 'invite' && tasks.find((task) => task.id === 'invite').status === 'pending') {
        navigate('/assets'); // Redirect to assets to see referral code
      }
    };
  
    const handleClaim = async (taskId) => {
      setIsLoading(true);
      try {
        const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        if (!userData) {
          throw new Error('User data not found');
        }
        let newBalance = userData.balance || 0;
        let updateData = {};
  
        if (taskId === 'signup' && userData.hasSignupBonus && !userData.hasSignupBonusClaimed) {
          newBalance += 5;
          updateData = { balance: newBalance, hasSignupBonusClaimed: true };
        } else if (taskId === 'firstDeposit' && userData.hasFirstDepositBonus && !userData.hasFirstDepositBonusClaimed) {
          newBalance += 10;
          updateData = { balance: newBalance, hasFirstDepositBonusClaimed: true };
        } else if (taskId === 'invite' && userData.referralCount > 0) {
          const rewardCount = userData.referralCount;
          newBalance += rewardCount * 2;
          updateData = { balance: newBalance, referralCount: 0 }; // Reset referral count after claim
        } else {
          throw new Error('Reward not available or already claimed');
        }
  
        await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, updateData);
        const updatedData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: task.id === 'invite' && updatedData.referralCount === 0 ? 'pending' : 'claimed' }
              : task
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Reward Claimed',
          text: `New balance: ${updatedData.balance.toFixed(2)} USDT`,
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            content: 'text-gray-700',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
      } catch (error) {
        let errorMessage = error.message;
        if (error.message.includes('User data not found')) {
          errorMessage = 'User data not found, please sign up';
          navigate('/signup');
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid API secret, please contact support';
          localStorage.removeItem('token');
          auth.signOut();
          navigate('/login');
        }
        Swal.fire({
          icon: 'error',
          title: 'Error Claiming Reward',
          text: errorMessage,
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            content: 'text-gray-700',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-gray-800" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-lg font-medium text-gray-800">Loading...</span>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
        <div className="mx-auto px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Tasks</h1>
          <div className="bg-white rounded-2xl p-6 shadow-xl animate-fade-in">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 mb-4 bg-gray-50 rounded-lg ${
                  task.status === 'pending' ? 'cursor-pointer hover:bg-gray-100 transition-all duration-300' : ''
                }`}
                onClick={() => task.status === 'pending' && handleTaskClick(task.id)}
              >
                <div className="flex items-center gap-3">
                  {task.status === 'claimed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : task.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.id === 'invite' ? `${task.description} (${task.count} referrals)` : task.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-yellow-500">
                    {task.id === 'invite' ? `$${task.reward * task.count} USDT` : `$${task.reward} USDT`}
                  </p>
                  {task.status === 'completed' && (
                    <button
                      onClick={() => handleClaim(task.id)}
                      className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}
  
  
  
  function Earn() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Earn</h2>
          <p className="text-sm text-gray-600 mb-4">Stake your assets to earn passive income or participate in yield farming.</p>
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="text-lg font-medium text-black mb-2">Earning Options</h3>
            <p className="text-sm text-gray-600">This feature is under development. Stay tuned for staking and farming opportunities.</p>
          </div>
        </div>
      </div>
    );
  }
  
  function Futures() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Futures</h2>
          <p className="text-sm text-gray-600 mb-4">Trade futures contracts with leverage to maximize your trading potential.</p>
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="text-lg font-medium text-black mb-2">Futures Trading</h3>
            <p className="text-sm text-gray-600">This feature is under development. Check back later for futures trading options.</p>
          </div>
        </div>
      </div>
    );
  }
  
  function Spot() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Spot</h2>
          <p className="text-sm text-gray-600 mb-4">Trade cryptocurrencies directly on our spot market with low fees.</p>
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="text-lg font-medium text-black mb-2">Spot Trading</h3>
            <p className="text-sm text-gray-600">This feature is under development. Stay tuned for spot trading capabilities.</p>
          </div>
        </div>
      </div>
    );
  }

  function NotAvalible() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full text-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Sorry</h2>
          <p className="text-sm text-gray-600 mb-4">We can't provide this page right now</p>
        </div>
      </div>
    );
  }
  function NotFound() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full text-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Not found</h2>
          <p className="text-sm text-gray-600 mb-4">there is no route same as the url</p>
        </div>
      </div>
    );
  }
  
  function Support() {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Support</h2>
          <p className="text-sm text-gray-600 mb-4">Get help with your account or trading issues from our support team.</p>
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="text-lg font-medium text-black mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Reach out to our 24/7 support team via email: support@quantumexchange.com</p>
            <button
              onClick={() => Swal.fire({
                icon: 'info',
                title: 'Support',
                text: 'Email us at support@quantumexchange.com for assistance.',
                confirmButtonColor: 'white',
                confirmButtonText: '<span class="text-black">Ok</span>',
              })}
              className="mt-4 px-3 py-1.5 text-sm text-white bg-black rounded-md hover:bg-gray-800"
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
            className={`fixed top-0 left-0 h-full w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <img src="./public/22072203_6549945.jpg" className="h-10" alt="logo" />
                <button onClick={toggleDrawer} className="p-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={toggleDrawer}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <button 
                    onClick={() => { handleLogout(); toggleDrawer(); }} 
                    className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
                  >
                    Log Out
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
                      onClick={toggleDrawer}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block bg-black text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-center"
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

    import {   Wallet } from 'lucide-react';
    export default function App() {
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [isDrawerOpen, setIsDrawerOpen] = useState(false);
      const [balance, setBalance] = useState(0);
      const navigate = useNavigate();


    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoggedIn(!!user);
        if (!user) {
          localStorage.removeItem('token');
          setBalance(0);
        } else {
          try {
            const token = await user.getIdToken(true);
            localStorage.setItem('token', token);
            // console.log('Fetching balance for user:', user.uid);
            const userData = await fetchWithErrorHandling('GET', `users/${user.uid}`);
            if (!userData) {
              throw new Error('User data not found');
            }
            setBalance(userData.balance || 0);
          } catch (error) {
            let errorMessage = error.message;
            if (error.message.includes('User data not found')) {
              errorMessage = 'User data not found, please sign up';
              navigate('/signup');
            } else if (error.message.includes('Unauthorized')) {
              errorMessage = 'Session expired, please log in again';
              localStorage.removeItem('token');
              navigate('/login');
            }
            Swal.fire({
              icon: 'error',
              title: 'Error Fetching Balance',
              text: errorMessage,
              confirmButtonColor: '#1f2937',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
                title: 'text-xl font-bold text-gray-900',
                content: 'text-gray-700',
                confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
              },
            });
          }
        }
      });
      return () => unsubscribe();
    }, [navigate]);


    const handleLogout = async () => {
      try {
        await signOut(auth);
        localStorage.removeItem('token');
        setBalance(0);
        Swal.fire({
          icon: 'success',
          title: 'Logout Successful',
          timer: 1000,
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
        navigate('/');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Logout Error',
          text: error.message,
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            content: 'text-gray-700',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white fixed top-0 left-0 right-0 z-50 shadow-lg">
          <div className="mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsDrawerOpen(true)} className="sm:hidden p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <img src="/assets/logo.png" className="h-10 w-10 rounded-full" alt="logo" />
                  <span className="text-xl font-bold">Quantum</span>
                </Link>
              </div>
              <nav className=" hidden md:!flex items-center space-x-6">
                {[
                  { to: '/support', label: 'Support' },
                  { to: '/Earn', label: 'Earn' },
                  { to: '/Futures', label: 'Futures' },
                  { to: '/Spot', label: 'Spot' },
                  { to: '/assets', label: 'Assets' },
                  { to: '/tasks', label: 'Tasks' },
                  { to: '/withdraw', label: 'Withdraw' },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${
                        isActive ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-200 hover:text-yellow-400'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                      <Wallet className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium">{balance.toFixed(2)} USDT</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-200 hover:text-yellow-400 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-gray-200 hover:text-yellow-400 transition-colors">
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 bg-yellow-400 text-gray-900 text-sm font-medium rounded-full hover:bg-yellow-500 transition-colors shadow-md"
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <Drawer
        isOpen={isDrawerOpen}
        toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />
      <main className="pt-20 pb-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/deposit" element={<DepositPage method={setBalance} />} />
          <Route path="/assets" element={<AssetsPage method={setBalance} />} />
          <Route path="/withdraw" element={<WithdrawPage method={setBalance} />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/support" element={<Support />} />
          <Route path="/Earn" element={<NotAvalible />} />
          <Route path="/Futures" element={<NotAvalible />} />
          <Route path="/Spot" element={<NotAvalible />} />
          <Route path="/transfer" element={<NotAvalible />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}


// import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
// import { auth } from './firebase';
// import { Eye, EyeOff, ChevronDown, ChevronRight, ChevronLeft, Menu, LogOut } from 'lucide-react';
// import { MdAssessment, MdOutlineAccountBox } from 'react-icons/md';
// import { RiFundsFill } from 'react-icons/ri';
// import Swal from 'sweetalert2';
// import GiftIcon from './GiftIcon';
// import LockIcon from './LockIcon';
// import ExpandIcon from './ExpandIcon';
// import InfoIcon from './InfoIcon';
// import { LuHeadset } from 'react-icons/lu';
// import { IoMdChatboxes } from 'react-icons/io';
// import { IoDocuments } from 'react-icons/io5';
// import { GrDocumentText } from 'react-icons/gr';
// import { FaChevronDown } from 'react-icons/fa';
// import { IoIosHelpCircleOutline } from 'react-icons/io';
// import { LuRefreshCw } from 'react-icons/lu';

// function Drawer({ isOpen, toggleDrawer, isLoggedIn, handleLogout }) {
//   return (
//     <>
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
//           onClick={toggleDrawer}
//         />
//       )}
//       <div 
//         className={`fixed top-0 left-0 h-full w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           <div className="flex items-center justify-between p-4 border-b border-gray-200">
//             <img src="./public/22072203_6549945.jpg" className="h-10" alt="logo" />
//             <button onClick={toggleDrawer} className="p-2">
//               <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <nav className="flex-1 flex flex-col p-4 space-y-2">
//             {[
//               { to: "/support", label: "Support" },
//               { to: "/Earn", label: "Earn" },
//               { to: "/Futures", label: "Futures" },
//               { to: "/Spot", label: "Spot" },
//               { to: "/assets", label: "Assets" },
//               { to: "/tasks", label: "Tasks" },
//               { to: "/withdraw", label: "Withdraw" },
//             ].map((item) => (
//               <Link
//                 key={item.to}
//                 to={item.to}
//                 className="text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
//                 onClick={toggleDrawer}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </nav>
//           <div className="p-4 border-t border-gray-200">
//             {isLoggedIn ? (
//               <button 
//                 onClick={() => { handleLogout(); toggleDrawer(); }} 
//                 className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
//               >
//                 Log Out
//               </button>
//             ) : (
//               <>
//                 <Link 
//                   to="/login" 
//                   className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
//                   onClick={toggleDrawer}
//                 >
//                   Log In
//                 </Link>
//                 <Link 
//                   to="/signup" 
//                   className="block bg-black text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-center"
//                   onClick={toggleDrawer}
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const token = await userCredential.user.getIdToken();
//       localStorage.setItem('token', token);
//       await fetch('http://localhost:5000/api/user/' + email, {
//         headers: { 'Authorization': `Bearer ${token}` },
//       });
//       Swal.fire({
//         icon: 'success',
//         title: 'Login successful',
//         timer: 1000,
//       });
//       navigate('/assets');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Login failed',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-md w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           className="w-full p-3 mb-4 bg-gray-200 rounded border border-gray-400"
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="w-full p-3 mb-4 bg-gray-200 rounded border border-gray-400"
//         />
//         <button
//           onClick={handleLogin}
//           className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition-colors"
//         >
//           Log In
//         </button>
//       </div>
//     </div>
//   );
// }

// function SignupPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [referralCode, setReferralCode] = useState('');
//   const navigate = useNavigate();

//   const handleSignup = async () => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const token = await userCredential.user.getIdToken();
//       localStorage.setItem('token', token);
//       const response = await fetch('http://localhost:5000/api/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password, referralCode }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'successfully signed up',
//           text: `referral code : ${data.referralCode}`,
//           timer: 1500,
//         });
//         navigate('/assets');
//       } else {
//         throw new Error(data.error);
//       }
//     } catch (error) {
//       let errorMessage = error.message;
//       if (error.code === 'auth/email-already-in-use') {
//         errorMessage = 'email has been used try another';
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = 'email is invalid';
//       } else if (error.code === 'auth/weak-password') {
//         errorMessage = 'password must be at least 6 charecter';
//       }
//       Swal.fire({
//         icon: 'error',
//         title: 'error',
//         text: errorMessage,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-md w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           className="w-full p-3 mb-4 bg-gray-200 rounded border border-gray-400"
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="w-full p-3 mb-4 bg-gray-200 rounded border border-gray-400"
//         />
//         <input
//           type="text"
//           value={referralCode}
//           onChange={(e) => setReferralCode(e.target.value)}
//           placeholder="Referral Code (optional)"
//           className="w-full p-3 mb-4 bg-gray-200 rounded border border-gray-400"
//         />
//         <button
//           onClick={handleSignup}
//           className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition-colors"
//         >
//           Sign Up
//         </button>
//       </div>
//     </div>
//   );
// }

// function LandingPage() {
//   return (
//     <div className="overflow-x-hidden overflow-y-auto w-full bg-white">
//       <div className="flex flex-col min-h-screen">
//         <main className="flex flex-1 flex-col">
//           <div className="text-black relative bg-gray-200" style={{
//             background: 'url(./public/12319936_SL-011719-17920-65.jpg)',
//             backgroundAttachment: 'fixed',
//             backgroundPosition: 'center',
//             backgroundSize: 'cover',
//           }}>
//             <div className="flex mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px", minHeight: "300px", paddingTop: "60px", paddingBottom: "60px" }}>
//               <div className="flex flex-col justify-center items-start">
//                 <div style={{ maxWidth: "560px" }}>
//                   <div className="text-black text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-snug md:leading-[56px] mb-2 sm:mb-4">
//                     Quantum: Your Gateway into Web3
//                   </div>
//                   <div className="mt-2 text-sm sm:text-base text-gray-600">
//                     Trading in cryptoassets involves a high degree of risk and may not be suitable for all investors. The value of cryptoassets can be extremely volatile and unpredictable, and can fluctuate significantly in a short period of time. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before trading in cryptoassets. Always trade responsibly and never invest more than you can afford to lose.
//                   </div>
//                   <div className="mt-6 sm:mt-8">
//                     <Link to="/tasks" className="inline-flex items-center justify-center cursor-pointer text-sm sm:text-base font-medium px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
//                       Claim Reward
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", fontSize: "14px", lineHeight: "21px", padding: "24px 0" }}>
//             <div className="mx-auto px-4 sm:px-6 border border-yellow-300 py-6 sm:py-8 bg-yellow-100 rounded-xl" style={{ maxWidth: "1248px" }}>
//               <div className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
//                 <strong className="block font-bold text-black">
//                   ⚠️ Important Notice: Advanced Trading Platform
//                 </strong>
//                 <div className="text-gray-600 mt-2">
//                   Quantum Exchange offers advanced trading features designed for experienced traders. Our platform provides access to spot trading, futures, and advanced order types. Please ensure you understand the risks involved before using leverage or derivative products.
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", padding: "40px 0" }}>
//             <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
//               <div className="flex flex-col md:flex-row gap-6">
//                 <div className="flex-1">
//                   <div className="mb-8 sm:mb-12">
//                     <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
//                       Get Started
//                     </div>
//                   </div>
//                   <div>
//                     {[
//                       { icon: <MdOutlineAccountBox className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 1: Create & Verify Account", desc: "Sign up for your Quantum account and complete identity verification to access all trading features and ensure platform security." },
//                       { icon: <MdAssessment className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 2: Complete Trading Assessment", desc: "Take our trading knowledge assessment to unlock advanced features and ensure you understand the risks of cryptocurrency trading." },
//                       { icon: <RiFundsFill className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 3: Fund & Start Trading", desc: "Deposit funds using multiple payment methods and start trading with advanced order types, leverage, and professional tools." },
//                     ].map((step, index) => (
//                       <div key={index} className="flex mb-8 sm:mb-12">
//                         <div className="flex items-start justify-center">
//                           {step.icon}
//                         </div>
//                         <div className="flex-1 ml-4 sm:ml-6">
//                           <div className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2">{step.title}</div>
//                           <div className="text-sm sm:text-base text-gray-600">{step.desc}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex-1 flex items-center justify-center order-2 my-6 md:my-0">
//                   <img src="./public/AdobeStock_1531277087_Preview.jpeg" className="rounded-2xl shadow-xl max-w-full h-auto" loading="lazy" alt="phone chart" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", padding: "24px 0" }}>
//             <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
//               <div className="flex flex-col md:flex-row gap-6">
//                 {[
//                   { title: "24/7 Live Support", desc: "Get instant help from our expert support team available around the clock for all your trading needs.", icon: <LuHeadset className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "Trading Guides", desc: "Access comprehensive guides and tutorials to master cryptocurrency trading strategies.", icon: <IoMdChatboxes className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "Market News", desc: "Stay updated with the latest cryptocurrency market news, analysis, and insights from industry experts.", icon: <IoDocuments className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "API Documentation", desc: "Integrate with our powerful API for algorithmic trading, portfolio management, and custom applications.", icon: <GrDocumentText className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                 ].map((card, index) => (
//                   <Link key={index} to="#" className="flex flex-col p-4 rounded-lg hover:bg-gray-100 transition-colors" style={{ textDecoration: "none", color: "inherit" }}>
//                     {card.icon}
//                     <div className="mt-4">
//                       <div className="font-medium text-black text-sm sm:text-base">{card.title}</div>
//                       <div className="text-gray-600 text-xs sm:text-sm mt-2">{card.desc}</div>
//                     </div>
//                     <button className="mt-6 bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
//                       {card.title === "24/7 Live Support" ? "Contact Support" : card.title === "Trading Guides" ? "Learn More" : card.title === "Market News" ? "Read News" : "View Docs"}
//                     </button>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// function DepositPage({ method }) {
//   const cryptoTokens = [
//     { symbol: "BTC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/xELvtL9Iwl3zGQNI0Pulb0ga2gRL7X1SUNKX-trYQDA.png" },
//     { symbol: "ETH", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/tEQGOiQJPDxf9_yYAAIXufQusF-RJu7KMR896FSHM0Y.png" },
//     { symbol: "USDC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/zyaWI7gZxnSeG41QO9K4mjscupStR5wuocJKIrhTHOU.png" },
//     { symbol: "SOL", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/IA4UUTbkgp7C7qcx_QzeckZcsm2La9YKjjD22McXAXw.png" },
//     { symbol: "USDT", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png" },
//   ];
//   const [selectValue, setSelectValue] = useState('BEP20');
//   const [countUsd, setCountUsd] = useState(0);
//   const [showBox, setShowBox] = useState(false);
//   const [walletAddress] = useState('TQbxf1wEuhY3vH5Ku3bB4qX64PWk2CPvfL');
//   const navigate = useNavigate();

//   const handleCopyAddress = () => {
//     navigator.clipboard.writeText(walletAddress);
//     Swal.fire({
//       icon: "success",
//       title: 'Copied',
//       timer: 1000,
//     });
//   };

//   const handleDeposit = async () => {
//     if (countUsd < 5) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Minimum deposit is 5 USDT',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     const token = localStorage.getItem('token');
//     if (!token) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Please log in first',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       navigate('/login');
//       return;
//     }
//     try {
//       const response = await fetch('http://localhost:5000/api/grant-bonus', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ email: auth.currentUser.email }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Deposit successful',
//           text: `Bonus granted: ${data.referralCode}`,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         method(data.balance || 0);
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Deposit failed',
//           text: data.error,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="mx-auto py-6 px-4 sm:px-6">
//         <div className="bg-white mx-auto max-w-3xl">
//           {showBox ? (
//             <div className="flex relative flex-col w-full mb-6">
//               <div className="flex-1">
//                 <div className="flex flex-row items-center gap-2 my-3">
//                   <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium z-10">4</div>
//                   <p className="text-sm font-medium text-gray-600 mb-2">Secure deposit</p>
//                 </div>
//                 <p className="text-sm font-medium text-gray-500 mb-2">How much money do you deposited?</p>
//                 <div className="relative">
//                   <input type="number" value={countUsd} onChange={(e) => setCountUsd(e.target.value)} className="flex items-center bg-gray-200 rounded border w-full border-gray-400 px-3 shadow-sm h-10 sm:h-12 text-sm" />
//                   {countUsd < 5 && <p className="text-xs sm:text-sm text-red-500 mt-2 mb-4">Value is invalid</p>}
//                 </div>
//               </div>
//               <p className="text-sm font-medium p-5 my-10 rounded-xl bg-yellow-100 border border-yellow-500 text-yellow-500 mb-2">This section is just for verify your account and your account security</p>
//             </div>
//           ) : (
//             <>
//               <div className="flex relative w-full mb-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">1</div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-600 mb-2">Currency</p>
//                   <div className="relative">
//                     <div className="flex items-center h-10 sm:h-12 px-3 bg-gray-200 rounded border border-gray-400 shadow-sm">
//                       <img src={cryptoTokens[4].icon} alt="USDT" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
//                       <span className="text-black text-sm font-semibold">USDT</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex relative w-full mb-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">2</div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-600 mb-2">Transfer network</p>
//                   <div className="relative">
//                     <select className="flex items-center bg-gray-200 rounded border w-full border-gray-400 shadow-sm cursor-pointer h-10 sm:h-12 text-sm" value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
//                       <optgroup title="Channels" className="bg-white rounded-3xl">
//                         <option className="text-black text-sm font-semibold" value="BEP20">BEP20</option>
//                         <option className="text-black text-sm font-semibold" value="TRX">TRX</option>
//                         <option className="text-black text-sm font-semibold" value="TRC20">TRC20</option>
//                       </optgroup>
//                     </select>
//                     <div className="text-gray-600 text-xs pt-1.5 break-words">
//                       You have selected {selectValue}. Please make sure that the same transfer network is also available on the withdrawal platform.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex relative w-full mt-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-white text-sm font-medium mr-4 z-10">3</div>
//                 <div className="flex-1">
//                   <p className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Deposit details</p>
//                   <div className="border border-gray-400 rounded-lg bg-gray-200">
//                     <div className="flex p-4">
//                       <div className="ml-4 flex flex-col justify-center flex-1">
//                         <div className="text-black text-sm font-medium mb-1">Deposit Address</div>
//                         <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
//                           <div className="text-black break-all text-sm sm:text-base">{walletAddress}</div>
//                           <button onClick={handleCopyAddress} className="flex items-center text-gray-600 text-xs sm:text-sm hover:text-gray-800">
//                             <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="px-4 mb-4">
//                       <div className="flex justify-between items-center">
//                         <div className="flex items-center text-sm">Deposit into your Quantum account</div>
//                       </div>
//                       <div className="bg-gray-400 h-px my-4 w-full"></div>
//                       <div className="space-y-2 text-sm">
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Minimum deposit</span>
//                           <span className="text-black">5 USDT</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Credited (available for trading)</span>
//                           <span className="text-black">1 network confirmation</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Unlocked (available for withdrawal)</span>
//                           <span className="text-black">1 network confirmation</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="bg-gray-300 rounded-md mx-4 mb-4 p-4 text-sm text-gray-600">
//                       <ul className="space-y-1">
//                         <li>This address can only be received <em className="text-orange-500 font-semibold not-italic">USDT</em></li>
//                         <li>Please confirm again that the main network you selected is <em className="text-orange-500 font-semibold not-italic">{selectValue}</em></li>
//                         <li>When you deposit funds into Futures account, the funds will be used to margin your positions.</li>
//                         <li>Funds will be credited to your currently selected account by default, please change this on the deposit page if necessary.</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//           <div className="flex w-full my-10 justify-end">
//             {!showBox && (
//               <button onClick={() => setShowBox(true)} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm</button>
//             )}
//             {showBox && (
//               <button onClick={handleDeposit} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm</button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function AssetsPage({ method }) {
//   const [showBalance, setShowBalance] = useState(true);
//   const [accountBalance, setAccountBalance] = useState(0);
//   const [referralCode, setReferralCode] = useState(null);
//   const [hasBonus, setHasBonus] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       try {
//         console.log(auth.currentUser.email);
        
//         const response = await fetch('http://localhost:5000/api/user/' + auth.currentUser.email, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         console.log(data);
//         if (response.ok) {
//           setAccountBalance(data.balance || 0);
//           setReferralCode(data.referralCode || null);
//           setHasBonus(data.hasBonus || false);
//           method(data.balance || 0);
          
//         } else {
          
//           Swal.fire({
//             icon: 'error',
//             title: 'Failed to fetch user data',
//             text: data.error,
//             confirmButtonColor: 'white',
//             confirmButtonText: '<span class="text-black">Ok</span>',
//           });
//           if (response.status === 401) {
//             localStorage.removeItem('token');
//             navigate('/login');
//           }
//         }
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Server error',
//           text: error.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     };
//     fetchUserData();
//   }, [navigate, method]);

//   const handleCopyReferralCode = () => {
//     if (referralCode) {
//       navigator.clipboard.writeText(referralCode);
//       Swal.fire({
//         icon: 'success',
//         title: 'Referral code copied',
//         timer: 1000,
//       });
//     }
//   };

//   const accountData = [
//     { name: "Spot Account", balance: `${accountBalance} USDT`, usdValue: `$${accountBalance.toFixed(2)}`, percentage: 100 },
//     { name: "DEX+ Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Futures Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Copy Trading", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Earn Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Trading Bots", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//   ];

//   return (
//     <div className="min-h-screen py-6 sm:py-8 bg-white text-black">
//       <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
//         <div className="mt-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
//             <h1 className="text-2xl sm:text-3xl font-bold text-black">Asset Summary</h1>
//             <div className="flex items-center gap-2 mt-4 sm:mt-0">
//               <NavLink to="/deposit" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-black text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors border border-black">Deposit</NavLink>
//               <NavLink to="/withdraw" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-transparent text-black text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400">Withdraw</NavLink>
//               <NavLink to="/transfer" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-transparent text-black text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400">Transfer</NavLink>
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <div className="rounded-xl">
//               <div className="flex items-center text-black">
//                 <span className="text-gray-600 text-sm font-medium">Total Asset Valuation</span>
//                 <button onClick={() => setShowBalance(!showBalance)} className="ml-2 sm:ml-3 cursor-pointer">
//                   {showBalance ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
//                 </button>
//               </div>
//               <div className="flex items-center mt-2">
//                 <span className="text-xl sm:text-2xl font-semibold text-black">{showBalance ? `$${accountBalance.toFixed(2)}` : "****"}</span>
//               </div>
//               <div className="text-gray-600 text-xs sm:text-sm font-medium mt-1">≈ {showBalance ? `$${accountBalance.toFixed(2)}` : "****"}</div>
//             </div>
//             {hasBonus ? (
//               <div className="mt-6 border border-gray-400 rounded-lg p-4">
//                 <h2 className="text-lg sm:text-xl font-medium text-black mb-2">Your Referral Code</h2>
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm sm:text-base font-semibold text-black">{referralCode || 'Loading...'}</span>
//                   <button
//                     onClick={handleCopyReferralCode}
//                     className="flex items-center text-gray-600 text-xs sm:text-sm hover:text-gray-800"
//                   >
//                     <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                     Copy
//                   </button>
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-600 mt-2">
//                   Share this code with friends. You earn 2 USDT for each user who signs up using your code.
//                 </p>
//               </div>
//             ) : (
//               <div className="mt-6 border border-gray-400 rounded-lg p-4">
//                 <h2 className="text-lg sm:text-xl font-medium text-black mb-2">Referral Program</h2>
//                 <p className="text-xs sm:text-sm text-gray-600">
//                   Deposit 5 USDT or more to unlock your referral code and start earning 2 USDT per referral!
//                 </p>
//                 <NavLink
//                   to="/deposit"
//                   className="inline-flex items-center justify-center mt-4 h-9 sm:h-10 px-3 sm:px-4 bg-black text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors border border-black"
//                 >
//                   Deposit Now
//                 </NavLink>
//               </div>
//             )}
//           </div>
//           <div className="border border-gray-400 rounded-lg mt-6">
//             <div className="flex items-center justify-between py-3 sm:py-4 px-6 sm:px-10 border-b border-gray-400">
//               <h2 className="text-xl sm:text-2xl font-medium text-black">My Assets</h2>
//             </div>
//             <ul className="pb-4 px-6 sm:px-10">
//               {accountData.map((account, index) => (
//                 <li key={account.name} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-20 cursor-pointer ${index > 0 ? "border-t border-gray-400" : ""}`}>
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center font-medium text-sm sm:text-base">
//                     <span className="min-w-[200px] sm:min-w-[280px] text-black font-semibold">{account.name}</span>
//                     <div className="flex items-center mt-2 sm:mt-0">
//                       <div className="flex-grow w-16 sm:w-20">
//                         <div className="bg-gray-300 rounded-full h-1.5 overflow-hidden">
//                           <div className="bg-black h-full" style={{ width: `${account.percentage}%` }}></div>
//                         </div>
//                       </div>
//                       <div className="text-black text-xs font-medium ml-3 sm:ml-4 min-w-16">{account.percentage.toFixed(2)}%</div>
//                     </div>
//                     <span className="text-black text-sm font-semibold">{account.balance}</span>
//                     <span className="text-gray-600 text-sm font-semibold mt-0.5">≈ {account.usdValue}</span>
//                   </div>
//                   <i className="w-4 h-4 ml-2 bg-no-repeat bg-center bg-contain" style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='m6 4 4 4-4 4'%3E%3C/svg%3E")` }} />
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="border border-gray-400 rounded-lg mt-6 min-h-[200px] sm:min-h-[280px]">
//             <div className="flex items-center justify-between py-3 sm:py-4 px-6 sm:px-10 border-b border-gray-400">
//               <h2 className="text-xl sm:text-2xl font-medium text-black">Recently Transfer Record</h2>
//               <a href="#" className="text-black text-sm font-semibold hover:underline">View All</a>
//             </div>
//             <ul className="pb-6 px-6 sm:px-10">
//               <div className="flex items-center justify-center flex-col py-12 sm:py-16">
//                 <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4">
//                   <svg width="100%" height="100%" className="overflow-hidden">
//                     <circle cx="50%" cy="50%" r="28" fill="none" stroke="#a0aec0" strokeWidth="2" strokeDasharray="4 4" />
//                     <circle cx="38%" cy="44%" r="2" fill="#a0aec0" />
//                     <circle cx="62%" cy="44%" r="2" fill="#a0aec0" />
//                     <path d="M20 40 Q32 48 44 40" stroke="#a0aec0" strokeWidth="2" fill="none" strokeLinecap="round" />
//                   </svg>
//                 </div>
//                 <span className="text-gray-600 text-xs font-medium text-center">No data available</span>
//               </div>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function WithdrawPage({ method }) {
//   const cryptoTokens = [
//     { symbol: "BTC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/xELvtL9Iwl3zGQNI0Pulb0ga2gRL7X1SUNKX-trYQDA.png" },
//     { symbol: "ETH", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/tEQGOiQJPDxf9_yYAAIXufQusF-RJu7KMR896FSHM0Y.png" },
//     { symbol: "USDC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/zyaWI7gZxnSeG41QO9K4mjscupStR5wuocJKIrhTHOU.png" },
//     { symbol: "SOL", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/IA4UUTbkgp7C7qcx_QzeckZcsm2La9YKjjD22McXAXw.png" },
//     { symbol: "USDT", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png" },
//   ];
//   const [selectValue, setSelectValue] = useState('BEP20');
//   const [countUsd, setCountUsd] = useState(0);
//   const [walletAddress, setWalletAddress] = useState('');
//   const navigate = useNavigate();

//   const handleWithdraw = async () => {
//     if (countUsd < 5) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Minimum withdrawal is 5 USDT',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     const token = localStorage.getItem('token');
//     if (!token) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Please log in first',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       navigate('/login');
//       return;
//     }
//     try {
//       const response = await fetch('http://localhost:5000/api/withdraw', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           email: auth.currentUser.email,
//           amount: parseFloat(countUsd),
//           network: selectValue,
//           address: walletAddress,
//         }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Withdrawal successful',
//           text: `New balance: ${data.balance} USDT`,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         method(data.balance || 0);
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Withdrawal failed',
//           text: data.error,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="mx-auto py-6 px-4 sm:px-6">
//         <div className="bg-white mx-auto max-w-3xl">
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">1</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Currency</p>
//               <div className="relative">
//                 <div className="flex items-center h-10 sm:h-12 px-3 bg-gray-200 rounded border border-gray-400 shadow-sm">
//                   <img src={cryptoTokens[4].icon} alt="USDT" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
//                   <span className="text-black text-sm font-semibold">USDT</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">2</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Transfer network</p>
//               <div className="relative">
//                 <select className="flex items-center bg-gray-200 rounded border w-full border-gray-400 shadow-sm cursor-pointer h-10 sm:h-12 text-sm" value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
//                   <optgroup title="Channels" className="bg-white rounded-3xl">
//                     <option className="text-black text-sm font-semibold" value="BEP20">BEP20</option>
//                     <option className="text-black text-sm font-semibold" value="TRX">TRX</option>
//                     <option className="text-black text-sm font-semibold" value="TRC20">TRC20</option>
//                   </optgroup>
//                 </select>
//                 <div className="text-gray-600 text-xs pt-1.5 break-words">
//                   You have selected {selectValue}. Please ensure the withdrawal platform supports this network.
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">3</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Withdrawal Address</p>
//               <input
//                 type="text"
//                 value={walletAddress}
//                 onChange={(e) => setWalletAddress(e.target.value)}
//                 placeholder="Enter your wallet address"
//                 className="w-full p-3 bg-gray-200 rounded border border-gray-400"
//               />
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">4</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Amount</p>
//               <input
//                 type="number"
//                 value={countUsd}
//                 onChange={(e) => setCountUsd(e.target.value)}
//                 placeholder="Enter amount (min 5 USDT)"
//                 className="w-full p-3 bg-gray-200 rounded border border-gray-400"
//               />
//               {countUsd < 5 && <p className="text-xs sm:text-sm text-red-500 mt-2 mb-4">Minimum withdrawal is 5 USDT</p>}
//             </div>
//           </div>
//           <div className="flex w-full my-10 justify-end">
//             <button onClick={handleWithdraw} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// function TasksPage() {
//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-3xl w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Tasks</h2>
//         <p className="text-sm text-gray-600 mb-4">Complete tasks to earn rewards and unlock additional features.</p>
//         <div className="border border-gray-400 rounded-lg p-4">
//           <h3 className="text-lg font-medium text-black mb-2">Available Tasks</h3>
//           <ul className="space-y-2">
//             <li className="flex justify-between items-center">
//               <span>Complete your first deposit (min 5 USDT)</span>
//               <button
//                 onClick={() => Swal.fire({
//                   icon: 'info',
//                   title: 'Task',
//                   text: 'Deposit 5 USDT to unlock this reward.',
//                   confirmButtonColor: 'white',
//                   confirmButtonText: '<span class="text-black">Go to Deposit</span>',
//                 })}
//                 className="px-3 py-1.5 text-sm text-white bg-black rounded-md hover:bg-gray-800"
//               >
//                 Start
//               </button>
//             </li>
//             <li className="flex justify-between items-center">
//               <span>Invite a friend with your referral code</span>
//               <button
//                 onClick={() => Swal.fire({
//                   icon: 'info',
//                   title: 'Task',
//                   text: 'Share your referral code to earn 2 USDT per referral.',
//                   confirmButtonColor: 'white',
//                   confirmButtonText: '<span class="text-black">Go to Assets</span>',
//                 })}
//                 className="px-3 py-1.5 text-sm text-white bg-black rounded-md hover:bg-gray-800"
//               >
//                 Start
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Earn() {
//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-3xl w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Earn</h2>
//         <p className="text-sm text-gray-600 mb-4">Stake your assets to earn passive income or participate in yield farming.</p>
//         <div className="border border-gray-400 rounded-lg p-4">
//           <h3 className="text-lg font-medium text-black mb-2">Earning Options</h3>
//           <p className="text-sm text-gray-600">This feature is under development. Stay tuned for staking and farming opportunities.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Futures() {
//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-3xl w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Futures</h2>
//         <p className="text-sm text-gray-600 mb-4">Trade futures contracts with leverage to maximize your trading potential.</p>
//         <div className="border border-gray-400 rounded-lg p-4">
//           <h3 className="text-lg font-medium text-black mb-2">Futures Trading</h3>
//           <p className="text-sm text-gray-600">This feature is under development. Check back later for futures trading options.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Spot() {
//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-3xl w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Spot</h2>
//         <p className="text-sm text-gray-600 mb-4">Trade cryptocurrencies directly on our spot market with low fees.</p>
//         <div className="border border-gray-400 rounded-lg p-4">
//           <h3 className="text-lg font-medium text-black mb-2">Spot Trading</h3>
//           <p className="text-sm text-gray-600">This feature is under development. Stay tuned for spot trading capabilities.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Support() {
//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="max-w-3xl w-full p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">Support</h2>
//         <p className="text-sm text-gray-600 mb-4">Get help with your account or trading issues from our support team.</p>
//         <div className="border border-gray-400 rounded-lg p-4">
//           <h3 className="text-lg font-medium text-black mb-2">Contact Support</h3>
//           <p className="text-sm text-gray-600">Reach out to our 24/7 support team via email: support@quantumexchange.com</p>
//           <button
//             onClick={() => Swal.fire({
//               icon: 'info',
//               title: 'Support',
//               text: 'Email us at support@quantumexchange.com for assistance.',
//               confirmButtonColor: 'white',
//               confirmButtonText: '<span class="text-black">Ok</span>',
//             })}
//             className="mt-4 px-3 py-1.5 text-sm text-white bg-black rounded-md hover:bg-gray-800"
//           >
//             Contact Now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [balance, setBalance] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsLoggedIn(!!user);
//       if (!user) {
//         localStorage.removeItem('token');
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       localStorage.removeItem('token');
//       Swal.fire({
//         icon: 'success',
//         title: 'Logged out successfully',
//         timer: 1000,
//       });
//       navigate('/');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Logout failed',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   const toggleDrawer = () => {
//     setIsDrawerOpen(!isDrawerOpen);
//   };

//   const setBalanceMethod = (newBalance) => {
//     setBalance(newBalance);
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
//         <div className="mx-auto px-4 sm:px-6 flex items-center justify-between h-16" style={{ maxWidth: "1248px" }}>
//           <Link to="/">
//             <img src="./public/22072203_6549945.jpg" alt="logo" className="h-10" />
//           </Link>
//           <nav className="hidden sm:flex items-center gap-4">
//             {[
//               { to: "/support", label: "Support" },
//               { to: "/Earn", label: "Earn" },
//               { to: "/Futures", label: "Futures" },
//               { to: "/Spot", label: "Spot" },
//               { to: "/assets", label: "Assets" },
//               { to: "/tasks", label: "Tasks" },
//               { to: "/withdraw", label: "Withdraw" },
//             ].map((item) => (
//               <NavLink
//                 key={item.to}
//                 to={item.to}
//                 className={({ isActive }) =>
//                   `text-sm font-medium ${isActive ? 'text-black font-semibold' : 'text-gray-600'} hover:text-black transition-colors`
//                 }
//               >
//                 {item.label}
//               </NavLink>
//             ))}
//           </nav>
//           <div className="flex items-center gap-2 sm:gap-4">
//             {isLoggedIn ? (
//               <>
//                 <span className="text-sm font-medium text-gray-600">Balance: ${balance.toFixed(2)}</span>
//                 <button
//                   onClick={handleLogout}
//                   className="hidden sm:flex items-center justify-center h-9 px-3 bg-transparent text-black text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400"
//                 >
//                   <LogOut className="w-4 h-4 mr-1" />
//                   Log Out
//                 </button>
//               </>
//             ) : (
//               <>
//                 <NavLink
//                   to="/login"
//                   className="hidden sm:flex items-center justify-center h-9 px-3 bg-transparent text-black text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400"
//                 >
//                   Log In
//                 </NavLink>
//                 <NavLink
//                   to="/signup"
//                   className="hidden sm:flex items-center justify-center h-9 px-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors border border-black"
//                 >
//                   Sign Up
//                 </NavLink>
//               </>
//             )}
//             <button onClick={toggleDrawer} className="sm:hidden p-2">
//               <Menu className="w-6 h-6 text-gray-600" />
//             </button>
//           </div>
//         </div>
//       </header>
//       <Drawer isOpen={isDrawerOpen} toggleDrawer={toggleDrawer} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
//       <main className="pt-16">
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/deposit" element={<DepositPage method={setBalanceMethod} />} />
//           <Route path="/assets" element={<AssetsPage method={setBalanceMethod} />} />
//           <Route path="/withdraw" element={<WithdrawPage method={setBalanceMethod} />} />
//           <Route path="/tasks" element={<TasksPage />} />
//           <Route path="/Earn" element={<Earn />} />
//           <Route path="/Futures" element={<Futures />} />
//           <Route path="/Spot" element={<Spot />} />
//           <Route path="/support" element={<Support />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }


// import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
// import { useState, useRef, useEffect } from "react";
// import { Eye, EyeOff, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
// import { MdAssessment, MdOutlineAccountBox } from "react-icons/md";
// import { RiFundsFill } from "react-icons/ri";
// import Swal from 'sweetalert2';
// import GiftIcon from './GiftIcon';
// import LockIcon from './LockIcon';
// import ExpandIcon from './ExpandIcon';
// import InfoIcon from './InfoIcon';
// import { LuHeadset } from "react-icons/lu";
// import { IoMdChatboxes } from "react-icons/io";
// import { IoDocuments } from "react-icons/io5";
// import { GrDocumentText } from "react-icons/gr";
// import { FaChevronDown } from "react-icons/fa";
// import { IoIosHelpCircleOutline } from "react-icons/io";
// import { LuRefreshCw } from "react-icons/lu";
// import { Menu, LogOut } from "lucide-react";

// function Drawer({ isOpen, toggleDrawer, isLoggedIn, handleLogout }) {
//   return (
//     <>
//       {/* Overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
//           onClick={toggleDrawer}
//         />
//       )}
      
//       {/* Drawer */}
//       <div 
//         className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           {/* Drawer Header */}
//           <div className="flex items-center justify-between p-4 border-b border-gray-200">
//             <img src="./public/22072203_6549945.jpg" className="h-10" alt="logo" />
//             <button onClick={toggleDrawer} className="p-2">
//               <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           {/* Drawer Menu Items */}
//           <nav className="flex-1 flex flex-col p-4 space-y-2">
//             {[
//               { to: "/support", label: "Support" },
//               { to: "/Earn", label: "Earn" },
//               { to: "/Futures", label: "Futures" },
//               { to: "/Spot", label: "Spot" },
//               { to: "/assets", label: "Assets" },
//               { to: "/tasks", label: "Tasks" },
//               { to: "/withdraw", label: "Withdraw" },
//             ].map((item) => (
//               <Link
//                 key={item.to}
//                 to={item.to}
//                 className="text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
//                 onClick={toggleDrawer}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </nav>
          
//           {/* Drawer Footer */}
//           <div className="p-4 border-t border-gray-200">
//             {isLoggedIn ? (
//               <button 
//                 onClick={() => { handleLogout(); toggleDrawer(); }} 
//                 className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
//               >
//                 Log Out
//               </button>
//             ) : (
//               <>
//                 <Link 
//                   to="/login" 
//                   className="block text-black text-base font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors mb-2"
//                   onClick={toggleDrawer}
//                 >
//                   Log In
//                 </Link>
//                 <Link 
//                   to="/signup" 
//                   className="block bg-black text-white text-base font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-center"
//                   onClick={toggleDrawer}
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// function LandingPage() {
//   return (
//     <div className="overflow-x-hidden overflow-y-auto w-full bg-white">
//       <div className="flex flex-col min-h-screen">
//         <main className="flex flex-1 flex-col">
//           <div className="text-black relative bg-gray-200" style={{
//             background: 'url(./public/12319936_SL-011719-17920-65.jpg)',
//             backgroundAttachment: 'fixed',
//             backgroundPosition: 'center',
//             backgroundSize: 'cover',
//           }}>
//             <div className="flex mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px", minHeight: "300px", paddingTop: "60px", paddingBottom: "60px" }}>
//               <div className="flex flex-col justify-center items-start">
//                 <div style={{ maxWidth: "560px" }}>
//                   <div className="text-black text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-snug md:leading-[56px] mb-2 sm:mb-4">
//                     Quantum: Your Gateway into Web3
//                   </div>
//                   <div className="mt-2 text-sm sm:text-base text-gray-600">
//                     Trading in cryptoassets involves a high degree of risk and may not be suitable for all investors. The value of cryptoassets can be extremely volatile and unpredictable, and can fluctuate significantly in a short period of time. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before trading in cryptoassets. Always trade responsibly and never invest more than you can afford to lose.
//                   </div>
//                   <div className="mt-6 sm:mt-8">
//                     <Link to="/tasks" className="inline-flex items-center justify-center cursor-pointer text-sm sm:text-base font-medium px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
//                       Claim Reward
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", fontSize: "14px", lineHeight: "21px", padding: "24px 0" }}>
//             <div className="mx-auto px-4 sm:px-6 border border-yellow-300 py-6 sm:py-8 bg-yellow-100 rounded-xl" style={{ maxWidth: "1248px" }}>
//               <div className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
//                 <strong className="block font-bold text-black">
//                   ⚠️ Important Notice: Advanced Trading Platform
//                 </strong>
//                 <div className="text-gray-600 mt-2">
//                   Quantum Exchange offers advanced trading features designed for experienced traders. Our platform provides access to spot trading, futures, and advanced order types. Please ensure you understand the risks involved before using leverage or derivative products.
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", padding: "40px 0" }}>
//             <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
//               <div className="flex flex-col md:flex-row gap-6">
//                 <div className="flex-1">
//                   <div className="mb-8 sm:mb-12">
//                     <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
//                       Get Started
//                     </div>
//                   </div>
//                   <div>
//                     {[
//                       { icon: <MdOutlineAccountBox className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 1: Create & Verify Account", desc: "Sign up for your Quantum account and complete identity verification to access all trading features and ensure platform security." },
//                       { icon: <MdAssessment className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 2: Complete Trading Assessment", desc: "Take our trading knowledge assessment to unlock advanced features and ensure you understand the risks of cryptocurrency trading." },
//                       { icon: <RiFundsFill className="text-5xl sm:text-6xl md:text-7xl text-gray-900" />, title: "Step 3: Fund & Start Trading", desc: "Deposit funds using multiple payment methods and start trading with advanced order types, leverage, and professional tools." },
//                     ].map((step, index) => (
//                       <div key={index} className="flex mb-8 sm:mb-12">
//                         <div className="flex items-start justify-center">
//                           {step.icon}
//                         </div>
//                         <div className="flex-1 ml-4 sm:ml-6">
//                           <div className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2">{step.title}</div>
//                           <div className="text-sm sm:text-base text-gray-600">{step.desc}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex-1 flex items-center justify-center order-2 my-6 md:my-0">
//                   <img src="./public/AdobeStock_1531277087_Preview.jpeg" className="rounded-2xl shadow-xl max-w-full h-auto" loading="lazy" alt="phone chart" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#f5f5f5", padding: "24px 0" }}>
//             <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
//               <div className="flex flex-col md:flex-row gap-6">
//                 {[
//                   { title: "24/7 Live Support", desc: "Get instant help from our expert support team available around the clock for all your trading needs.", icon: <LuHeadset className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "Trading Guides", desc: "Access comprehensive guides and tutorials to master cryptocurrency trading strategies.", icon: <IoMdChatboxes className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "Market News", desc: "Stay updated with the latest cryptocurrency market news, analysis, and insights from industry experts.", icon: <IoDocuments className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                   { title: "API Documentation", desc: "Integrate with our powerful API for algorithmic trading, portfolio management, and custom applications.", icon: <GrDocumentText className="text-5xl sm:text-6xl md:text-7xl text-gray-900" /> },
//                 ].map((card, index) => (
//                   <Link key={index} to="#" className="flex flex-col p-4 rounded-lg hover:bg-gray-100 transition-colors" style={{ textDecoration: "none", color: "inherit" }}>
//                     {card.icon}
//                     <div className="mt-4">
//                       <div className="font-medium text-black text-sm sm:text-base">{card.title}</div>
//                       <div className="text-gray-600 text-xs sm:text-sm mt-2">{card.desc}</div>
//                     </div>
//                     <button className="mt-6 bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
//                       {card.title === "24/7 Live Support" ? "Contact Support" : card.title === "Trading Guides" ? "Learn More" : card.title === "Market News" ? "Read News" : "View Docs"}
//                     </button>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// function DepositPage({ method }) {
//   const cryptoTokens = [
//     { symbol: "BTC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/xELvtL9Iwl3zGQNI0Pulb0ga2gRL7X1SUNKX-trYQDA.png" },
//     { symbol: "ETH", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/tEQGOiQJPDxf9_yYAAIXufQusF-RJu7KMR896FSHM0Y.png" },
//     { symbol: "USDC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/zyaWI7gZxnSeG41QO9K4mjscupStR5wuocJKIrhTHOU.png" },
//     { symbol: "SOL", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/IA4UUTbkgp7C7qcx_QzeckZcsm2La9YKjjD22McXAXw.png" },
//     { symbol: "USDT", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png" },
//   ];
//   const [selectValue, setSelectValue] = useState('BEP20');
//   const [countUsd, setCountUsd] = useState(0);
//   const [showBox, setShowBox] = useState(false);
//   const [walletAddress] = useState('TQbxf1wEuhY3vH5Ku3bB4qX64PWk2CPvfL');
//   const navigate = useNavigate();

//   const handleCopyAddress = () => {
//     navigator.clipboard.writeText(walletAddress);
//     Swal.fire({
//       icon: "success",
//       title: 'Copied',
//       timer: 1000,
//     });
//   };

//   const handleDeposit = async () => {
//     if (countUsd < 5) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Minimum deposit is 5 USDT',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     const token = localStorage.getItem('token');
//     if (!token) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Please log in first',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       navigate('/login');
//       return;
//     }
//     try {
//       const response = await fetch('http://localhost:5000/api/deposit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           crypto: 'USDT',
//           amount: parseFloat(countUsd),
//           network: selectValue,
//           address: walletAddress,
//         }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Deposit successful',
//           text: `New balance: ${data.balance} USDT`,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         // Notify server about deposit to check for 10 USDT bonus eligibility
//         if (countUsd >= 5) {
//           await fetch('http://localhost:5000/api/bonuses/update-deposit', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({ amount: parseFloat(countUsd) }),
//           });
//         }
//         method(countUsd);
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Deposit failed',
//           text: data.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="mx-auto py-6 px-4 sm:px-6">
//         <div className="bg-white mx-auto max-w-3xl">
//           {showBox ? (
//             <div className="flex relative flex-col w-full mb-6">
//               <div className="flex-1">
//                 <div className="flex flex-row items-center gap-2 my-3">
//                   <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium z-10">4</div>
//                   <p className="text-sm font-medium text-gray-600 mb-2">Secure deposit</p>
//                 </div>
//                 <p className="text-sm font-medium text-gray-500 mb-2">How much money do you deposited?</p>
//                 <div className="relative">
//                   <input type="number" value={countUsd} onChange={(e) => setCountUsd(e.target.value)} className="flex items-center bg-gray-200 rounded border w-full border-gray-400 px-3 shadow-sm h-10 sm:h-12 text-sm" />
//                   {countUsd < 5 && <p className="text-xs sm:text-sm text-red-500 mt-2 mb-4">Value is invalid</p>}
//                 </div>
//               </div>
//               <p className="text-sm font-medium p-5 my-10 rounded-xl bg-yellow-100 border border-yellow-500 text-yellow-500 mb-2">This section is just for verify your account and your account security</p>
//             </div>
//           ) : (
//             <>
//               <div className="flex relative w-full mb-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">1</div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-600 mb-2">Currency</p>
//                   <div className="relative">
//                     <div className="flex items-center h-10 sm:h-12 px-3 bg-gray-200 rounded border border-gray-400 shadow-sm">
//                       <img src={cryptoTokens[4].icon} alt="USDT" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
//                       <span className="text-black text-sm font-semibold">USDT</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex relative w-full mb-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">2</div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-600 mb-2">Transfer network</p>
//                   <div className="relative">
//                     <select className="flex items-center bg-gray-200 rounded border w-full border-gray-400 shadow-sm cursor-pointer h-10 sm:h-12 text-sm" value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
//                       <optgroup title="Channels" className="bg-white rounded-3xl">
//                         <option className="text-black text-sm font-semibold" value="BEP20">BEP20</option>
//                         <option className="text-black text-sm font-semibold" value="TRX">TRX</option>
//                         <option className="text-black text-sm font-semibold" value="TRC20">TRC20</option>
//                       </optgroup>
//                     </select>
//                     <div className="text-gray-600 text-xs pt-1.5 break-words">
//                       You have selected {selectValue}. Please make sure that the same transfer network is also available on the withdrawal platform.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex relative w-full mt-6">
//                 <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-white text-sm font-medium mr-4 z-10">3</div>
//                 <div className="flex-1">
//                   <p className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Deposit details</p>
//                   <div className="border border-gray-400 rounded-lg bg-gray-200">
//                     <div className="flex p-4">
//                       <div className="ml-4 flex flex-col justify-center flex-1">
//                         <div className="text-black text-sm font-medium mb-1">Deposit Address</div>
//                         <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
//                           <div className="text-black break-all text-sm sm:text-base">{walletAddress}</div>
//                           <button onClick={handleCopyAddress} className="flex items-center text-gray-600 text-xs sm:text-sm hover:text-gray-800">
//                             <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="px-4 mb-4">
//                       <div className="flex justify-between items-center">
//                         <div className="flex items-center text-sm">Deposit into your Quantum account</div>
//                       </div>
//                       <div className="bg-gray-400 h-px my-4 w-full"></div>
//                       <div className="space-y-2 text-sm">
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Minimum deposit</span>
//                           <span className="text-black">5 USDT</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Credited (available for trading)</span>
//                           <span className="text-black">1 network confirmation</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="font-semibold text-black">Unlocked (available for withdrawal)</span>
//                           <span className="text-black">1 network confirmation</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="bg-gray-300 rounded-md mx-4 mb-4 p-4 text-sm text-gray-600">
//                       <ul className="space-y-1">
//                         <li>This address can only be received <em className="text-orange-500 font-semibold not-italic">USDT</em></li>
//                         <li>Please confirm again that the main network you selected is <em className="text-orange-500 font-semibold not-italic">{selectValue}</em></li>
//                         <li>When you deposit funds into Futures account, the funds will be used to margin your positions.</li>
//                         <li>Funds will be credited to your currently selected account by default, please change this on the deposit page if necessary.</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//           <div className="flex w-full my-10 justify-end">
//             {!showBox && (
//               <button onClick={() => setShowBox(true)} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm</button>
//             )}
//             {showBox && (
//               <button onClick={handleDeposit} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm</button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// function AssetsPage({ method }) {
//   const [showBalance, setShowBalance] = useState(true);
//   const [selectedCurrency] = useState("USDT");
//   const [accountBalance, setAccountBalance] = useState(0);
//   const [referralCode, setReferralCode] = useState(null);
//   const [hasBonus, setHasBonus] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       try {
//         const response = await fetch('http://localhost:5000/api/user', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         if (response.ok) {
//           setAccountBalance(data.balance || 0);
//           setReferralCode(data.referralCode || null);
//           setHasBonus(data.hasBonus || false);
//           method(data.balance || 0); // Update parent balance
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Failed to fetch user data',
//             text: data.message,
//             confirmButtonColor: 'white',
//             confirmButtonText: '<span class="text-black">Ok</span>',
//           });
//           if (response.status === 401) {
//             localStorage.removeItem('token');
//             navigate('/login');
//           }
//         }
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Server error',
//           text: error.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     };
//     fetchUserData();
//   }, [navigate, method]);

//   const handleCopyReferralCode = () => {
//     if (referralCode) {
//       navigator.clipboard.writeText(referralCode);
//       Swal.fire({
//         icon: 'success',
//         title: 'Referral code copied',
//         timer: 1000,
//       });
//     }
//   };

//   const accountData = [
//     { name: "Spot Account", balance: `${accountBalance} USDT`, usdValue: `$${accountBalance.toFixed(2)}`, percentage: 100 },
//     { name: "DEX+ Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Futures Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Copy Trading", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Earn Account", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//     { name: "Trading Bots", balance: "0.00000000 USDT", usdValue: "$0.00", percentage: 0 },
//   ];

//   return (
//     <div className="min-h-screen py-6 sm:py-8 bg-white text-black">
//       <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
//         <div className="mt-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
//             <h1 className="text-2xl sm:text-3xl font-bold text-black">Asset Summary</h1>
//             <div className="flex items-center gap-2 mt-4 sm:mt-0">
//               <NavLink to="/deposit" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-black text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors border border-black">Deposit</NavLink>
//               <NavLink to="/withdraw" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-transparent text-black text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400">Withdraw</NavLink>
//               <NavLink to="/transfer" className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-transparent text-black text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors border border-gray-400">Transfer</NavLink>
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <div className="rounded-xl">
//               <div className="flex items-center text-black">
//                 <span className="text-gray-600 text-sm font-medium">Total Asset Valuation</span>
//                 <button onClick={() => setShowBalance(!showBalance)} className="ml-2 sm:ml-3 cursor-pointer">
//                   {showBalance ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
//                 </button>
//               </div>
//               <div className="flex items-center mt-2">
//                 <span className="text-xl sm:text-2xl font-semibold text-black">{showBalance ? `$${accountBalance.toFixed(2)}` : "****"}</span>
//               </div>
//               <div className="text-gray-600 text-xs sm:text-sm font-medium mt-1">≈ {showBalance ? `$${accountBalance.toFixed(2)}` : "****"}</div>
//             </div>
//             <div className="flex rounded border-gray-400 text-black mt-4">
//               <a href="#" className="flex items-center text-black cursor-pointer">
//                 <div className="flex items-center">
//                   <div className="border-b border-dashed border-gray-400 text-black">Today's PNL: </div>
//                   <div className="text-black ml-1">
//                     <span className="inline-block">0.0000 USDT</span>
//                   </div>
//                   <div className="text-black">
//                     <span className="inline-block">(0.00%)</span>
//                   </div>
//                 </div>
//                 <div className="w-4 h-4 ml-0.5">
//                   <ChevronRight className="w-4 h-4" />
//                 </div>
//               </a>
//             </div>
//             {/* Referral Code Section */}
//             {hasBonus ? (
//               <div className="mt-6 border border-gray-400 rounded-lg p-4">
//                 <h2 className="text-lg sm:text-xl font-medium text-black mb-2">Your Referral Code</h2>
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm sm:text-base font-semibold text-black">{referralCode || 'Loading...'}</span>
//                   <button
//                     onClick={handleCopyReferralCode}
//                     className="flex items-center text-gray-600 text-xs sm:text-sm hover:text-gray-800"
//                   >
//                     <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                     Copy
//                   </button>
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-600 mt-2">
//                   Share this code with friends. You earn 2 USDT for each user who signs up using your code.
//                 </p>
//               </div>
//             ) : (
//               <div className="mt-6 border border-gray-400 rounded-lg p-4">
//                 <h2 className="text-lg sm:text-xl font-medium text-black mb-2">Referral Program</h2>
//                 <p className="text-xs sm:text-sm text-gray-600">
//                   Deposit 5 USDT or more to unlock your referral code and start earning 2 USDT per referral!
//                 </p>
//                 <NavLink
//                   to="/deposit"
//                   className="inline-flex items-center justify-center mt-4 h-9 sm:h-10 px-3 sm:px-4 bg-black text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors border border-black"
//                 >
//                   Deposit Now
//                 </NavLink>
//               </div>
//             )}
//           </div>
//           <div className="border border-gray-400 rounded-lg mt-6">
//             <div className="flex items-center justify-between py-3 sm:py-4 px-6 sm:px-10 border-b border-gray-400">
//               <h2 className="text-xl sm:text-2xl font-medium text-black">My Assets</h2>
//             </div>
//             <ul className="pb-4 px-6 sm:px-10">
//               {accountData.map((account, index) => (
//                 <li key={account.name} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-20 cursor-pointer ${index > 0 ? "border-t border-gray-400" : ""}`}>
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center font-medium text-sm sm:text-base">
//                     <span className="min-w-[200px] sm:min-w-[280px] text-black font-semibold">{account.name}</span>
//                     <div className="flex items-center mt-2 sm:mt-0">
//                       <div className="flex-grow w-16 sm:w-20">
//                         <div className="bg-gray-300 rounded-full h-1.5 overflow-hidden">
//                           <div className="bg-black h-full" style={{ width: `${account.percentage}%` }}></div>
//                         </div>
//                       </div>
//                       <div className="text-black text-xs font-medium ml-3 sm:ml-4 min-w-16">{account.percentage.toFixed(2)}%</div>
//                     </div>
//                     <span className="text-black text-sm font-semibold">{account.balance}</span>
//                     <span className="text-gray-600 text-sm font-semibold mt-0.5">≈ {account.usdValue}</span>
//                   </div>
//                   <i className="w-4 h-4 ml-2 bg-no-repeat bg-center bg-contain" style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='m6 4 4 4-4 4'%3E%3C/svg%3E")` }} />
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="border border-gray-400 rounded-lg mt-6 min-h-[200px] sm:min-h-[280px]">
//             <div className="flex items-center justify-between py-3 sm:py-4 px-6 sm:px-10 border-b border-gray-400">
//               <h2 className="text-xl sm:text-2xl font-medium text-black">Recently Transfer Record</h2>
//               <a href="#" className="text-black text-sm font-semibold hover:underline">View All</a>
//             </div>
//             <ul className="pb-6 px-6 sm:px-10">
//               <div className="flex items-center justify-center flex-col py-12 sm:py-16">
//                 <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4">
//                   <svg width="100%" height="100%" className="overflow-hidden">
//                     <circle cx="50%" cy="50%" r="28" fill="none" stroke="#a0aec0" strokeWidth="2" strokeDasharray="4 4" />
//                     <circle cx="38%" cy="44%" r="2" fill="#a0aec0" />
//                     <circle cx="62%" cy="44%" r="2" fill="#a0aec0" />
//                     <path d="M20 40 Q32 48 44 40" stroke="#a0aec0" strokeWidth="2" fill="none" strokeLinecap="round" />
//                   </svg>
//                 </div>
//                 <span className="text-gray-600 text-xs font-medium text-center">No data available</span>
//               </div>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function WithdrawPage({ method }) {
//   const cryptoTokens = [
//     { symbol: "BTC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/xELvtL9Iwl3zGQNI0Pulb0ga2gRL7X1SUNKX-trYQDA.png" },
//     { symbol: "ETH", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/tEQGOiQJPDxf9_yYAAIXufQusF-RJu7KMR896FSHM0Y.png" },
//     { symbol: "USDC", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/zyaWI7gZxnSeG41QO9K4mjscupStR5wuocJKIrhTHOU.png" },
//     { symbol: "SOL", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/IA4UUTbkgp7C7qcx_QzeckZcsm2La9YKjjD22McXAXw.png" },
//     { symbol: "USDT", icon: "https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png" },
//   ];
//   const [selectValue, setSelectValue] = useState('BEP20');
//   const [countUsd, setCountUsd] = useState(0);
//   const [walletAddress, setWalletAddress] = useState('');
//   const [accountBalance, setAccountBalance] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchBalance = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       try {
//         const response = await fetch('http://localhost:5000/api/auth/profile', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         if (response.ok) {
//           setAccountBalance(data.balance || 0);
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Failed to fetch balance',
//             text: data.message,
//             confirmButtonColor: 'white',
//             confirmButtonText: '<span class="text-black">Ok</span>',
//           });
//           if (response.status === 401) {
//             localStorage.removeItem('token');
//             navigate('/login');
//           }
//         }
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Server error',
//           text: error.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     };
//     fetchBalance();
//   }, [navigate]);

//   const handleWithdraw = async () => {
//     if (countUsd < 19.69476) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Minimum withdrawal is 19.69476 USDT',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     if (countUsd > accountBalance) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Insufficient balance',
//         text: `Available balance: ${accountBalance} USDT`,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     if (!walletAddress) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Please enter a valid wallet address',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     const token = localStorage.getItem('token');
//     if (!token) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Please log in first',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       navigate('/login');
//       return;
//     }
//     try {
//       const response = await fetch('http://localhost:5000/api/withdraw', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           crypto: 'USDT',
//           amount: parseFloat(countUsd),
//           network: selectValue,
//           address: walletAddress,
//         }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Withdrawal successful',
//           text: `New balance: ${data.balance} USDT`,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         method(-countUsd);
//         setAccountBalance(data.balance);
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Withdrawal failed',
//           text: data.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         if (response.status === 401) {
//           localStorage.removeItem('token');
//           navigate('/login');
//         } else if (response.status === 403 && data.message.includes('15 days')) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Withdrawal restricted',
//             text: 'You must wait 15 days from your registration date to withdraw funds',
//             confirmButtonColor: 'white',
//             confirmButtonText: '<span class="text-black">Ok</span>',
//           });
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="mx-auto py-6 px-4 sm:px-6">
//         <div className="bg-white mx-auto max-w-3xl">
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">1</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Currency</p>
//               <div className="relative">
//                 <div className="flex items-center h-10 sm:h-12 px-3 bg-gray-200 rounded border border-gray-400 shadow-sm">
//                   <img src={cryptoTokens[4].icon} alt="USDT" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
//                   <span className="text-black text-sm font-semibold">USDT</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">2</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Transfer network</p>
//               <div className="relative">
//                 <select className="flex items-center bg-gray-200 rounded border w-full border-gray-400 shadow-sm cursor-pointer h-10 sm:h-12 text-sm" value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
//                   <optgroup title="Channels" className="bg-white rounded-3xl">
//                     <option className="text-black text-sm font-semibold" value="BEP20">BEP20</option>
//                     <option className="text-black text-sm font-semibold" value="TRX">TRX</option>
//                     <option className="text-black text-sm font-semibold" value="TRC20">TRC20</option>
//                   </optgroup>
//                 </select>
//                 <div className="text-gray-600 text-xs pt-1.5 break-words">
//                   You have selected {selectValue}. Please make sure that the same transfer network is also available on the withdrawal platform.
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">3</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Withdrawal Amount</p>
//               <div className="relative">
//                 <input 
//                   type="number" 
//                   value={countUsd} 
//                   onChange={(e) => setCountUsd(e.target.value)} 
//                   className="flex items-center bg-gray-200 rounded border w-full border-gray-400 px-3 shadow-sm h-10 sm:h-12 text-sm" 
//                   placeholder="Enter amount in USDT"
//                 />
//                 {countUsd < 19.69476 && <p className="text-xs sm:text-sm text-red-500 mt-2 mb-4">Minimum withdrawal is 19.69476 USDT</p>}
//               </div>
//             </div>
//           </div>
//           <div className="flex relative w-full mb-6">
//             <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black bg-black text-white text-sm font-medium mr-4 z-10">4</div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-600 mb-2">Wallet Address</p>
//               <div className="relative">
//                 <input 
//                   type="text" 
//                   value={walletAddress} 
//                   onChange={(e) => setWalletAddress(e.target.value)} 
//                   className="flex items-center bg-gray-200 rounded border w-full border-gray-400 px-3 shadow-sm h-10 sm:h-12 text-sm" 
//                   placeholder="Enter your wallet address"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="border border-gray-400 rounded-lg bg-gray-200 p-4">
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="font-semibold text-black">Available Balance</span>
//                 <span className="text-black">{accountBalance.toFixed(2)} USDT</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-black">Minimum Withdrawal</span>
//                 <span className="text-black">19.69476 USDT</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-black">Network Fee</span>
//                 <span className="text-black">1 USDT</span>
//               </div>
//             </div>
//             <div className="bg-gray-300 rounded-md mx-4 mt-4 p-4 text-sm text-gray-600">
//               <ul className="space-y-1">
//                 <li>Ensure the wallet address is correct. Incorrect addresses may result in loss of funds.</li>
//                 <li>Withdrawals are processed after 1 network confirmation.</li>
//                 <li>You must wait 15 days from your registration date to withdraw funds.</li>
//               </ul>
//             </div>
//           </div>
//           <div className="flex w-full my-10 justify-end">
//             <button onClick={handleWithdraw} className="px-3 py-1.5 text-sm sm:text-base md:text-xl text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">Confirm Withdrawal</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function TasksPage({ method }) {
//   const [activeTab, setActiveTab] = useState("novice");
//   const [expandedFaq, setExpandedFaq] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [signupBonusClaimed, setSignupBonusClaimed] = useState(true); // Initially locked
//   const [depositBonusClaimed, setDepositBonusClaimed] = useState(true); // Initially locked
//   const [priceFloorBonusClaimed, setPriceFloorBonusClaimed] = useState(true); // Initially locked
//   const sliderRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchBonusStatus = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) return;
//       try {
//         const response = await fetch('http://localhost:5000/api/bonuses/status', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         if (response.ok) {
//           setSignupBonusClaimed(data.signupBonusClaimed);
//           setDepositBonusClaimed(data.depositBonusClaimed);
//           setPriceFloorBonusClaimed(data.priceFloorBonusClaimed);
//         }
//       } catch (error) {
//         console.error('Error fetching bonus status:', error);
//       }
//     };
//     fetchBonusStatus();
//   }, [isLoggedIn]);

//   const toggleFaq = (index) => {
//     setExpandedFaq(expandedFaq === index ? null : index);
//   };

//   const scrollLeft = () => {
//     if (sliderRef.current) {
//       sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
//     }
//   };

//   const scrollRight = () => {
//     if (sliderRef.current) {
//       sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
//     }
//   };

//   const rewardAmounts = [
//     { amount: "5 USDT", type: "signup", unlocked: !signupBonusClaimed },
//     { amount: "10 USDT", type: "deposit", unlocked: !depositBonusClaimed },
//     { amount: "30 USDT", type: "priceFloor", unlocked: signupBonusClaimed && depositBonusClaimed && !priceFloorBonusClaimed },
//     { amount: "15 USDT", unlocked: false },
//     { amount: "25 USDT", unlocked: false },
//     { amount: "50 USDT", unlocked: false },
//   ];

//   const faqItems = [
//     {
//       question: "How to participate in the New User Tasks",
//       answer: "After signing up for an account, users must complete tasks (such as deposit and trade) requirements within 14 days to be eligible for incentives. New User Tasks will expire 14 days after registration. Tasks and rewards may vary by region. Each user can participate in the New User Tasks event and claim rewards only once. Any deposits or trades made outside this time will not be counted towards the incentive calculation.",
//     },
//     {
//       question: "What are Futures Bonus, Trial Funds, and Cash Vouchers?",
//       answer: "1) Futures Bonus: This bonus can be used to trade Perpetual Futures risk-free. Profits arising from these trades can be withdrawn directly. For specific rules, please refer to Introducing Perpetual Futures Bonus 2) Trial Funds: These funds can cover position opening costs, trading fees, and funding fees, and even offset trading losses. For specific rules, please refer to Introducing Trial Funds (User Guide & FAQ) 3) Cash Vouchers: Cash Vouchers are rewards issued by Toobit that appear as funds in your contract account. These can be used alongside your own funds as a margin for contract trading or to offset trading losses. For specific rules, please refer to Toobit Cash Voucher Usage Guide",
//     },
//     {
//       question: "What happens if I don't claim my rewards before the expiration date?",
//       answer: "Unclaimed rewards will expire and cannot be re-issued. Please make sure to claim and use your rewards within the specified timeframe.",
//     },
//   ];

//   const guides = [
//     {
//       title: "New User Guide -- USDT Perpetual",
//       image: "./public/2151611164.jpg",
//       url: "https://support.toobit.com/hc/en-us/articles/15879567537177",
//     },
//     {
//       title: "New User Guide -- Spot Trading",
//       image: "./public/2151611191.jpg",
//       url: "https://support.toobit.com/hc/en-us/articles/13186795760921",
//     },
//     {
//       title: "New User Guide -- Copy Trading",
//       image: "./public/2151611203.jpg",
//       url: "https://support.toobit.com/hc/en-us/articles/17045862348057",
//     },
//   ];

//   const handleClaimReward = async (reward, type) => {
//     if (!isLoggedIn) {
//       Swal.fire({
//         icon: 'error',
//         title: 'You have to Log In first',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       navigate('/login');
//       return;
//     }
//     if ((type === 'signup' && signupBonusClaimed) || 
//         (type === 'deposit' && depositBonusClaimed) || 
//         (type === 'priceFloor' && priceFloorBonusClaimed)) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Reward already claimed',
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//       return;
//     }
//     try {
//       const response = await fetch('http://localhost:5000/api/deposit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           crypto: 'USDT',
//           amount: parseFloat(reward.split(' ')[0]),
//           network: 'BEP20',
//           address: 'REWARD_ADDRESS',
//         }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         // Update bonus status
//         await fetch('http://localhost:5000/api/bonuses/claim', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//           body: JSON.stringify({ type }),
//         });
//         if (type === 'signup') {
//           setSignupBonusClaimed(true);
//         } else if (type === 'deposit') {
//           setDepositBonusClaimed(true);
//         } else if (type === 'priceFloor') {
//           setPriceFloorBonusClaimed(true);
//         }
//         Swal.fire({
//           icon: 'success',
//           title: `Successfully claimed ${reward}`,
//           text: `New balance: ${data.balance} USDT`,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//         method(reward.split(' ')[0]);
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Failed to claim reward',
//           text: data.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="border-b border-gray-400">
//         <div className="mx-auto px-4 sm:px-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 gap-4">
//             <div className="flex w-full sm:w-auto">
//               <div className="relative">
//                 <div className="flex">
//                   <div className="flex h-10 sm:h-12 relative">
//                     <div className={`absolute bottom-0 h-0.5 bg-black transition-all duration-300 ${activeTab === "novice" ? "w-24 sm:w-32 left-0" : "w-28 sm:w-36 left-28 sm:left-36"}`} />
//                     <button className={`px-3 h-10 sm:h-12 text-sm sm:text-lg font-medium ${activeTab === "novice" ? "text-black" : "text-gray-600"}`} onClick={() => setActiveTab("novice")}>
//                       New User Tasks
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
//               <Link to="#" className="flex items-center h-8 px-2 sm:px-3 border border-gray-400 rounded-lg text-xs sm:text-sm font-medium text-black hover:bg-gray-300 transition-colors">
//                 <span className="hidden sm:inline">Reward Center</span>
//                 <span className="sm:hidden">Rewards</span>
//               </Link>
//               <Link to="#" className="flex items-center h-8 px-2 sm:px-3 border border-gray-400 rounded-lg text-xs sm:text-sm font-medium text-black hover:bg-gray-300 transition-colors">
//                 <span className="hidden sm:inline">Task History</span>
//                 <span className="sm:hidden">History</span>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="mb-12 sm:mb-20">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6">
//           <div className="pt-6 sm:pt-8">
//             <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight">Unbox Surprises, Unlock Rewards – Your Journey to Excitement Begins Here!</h1>
//           </div>
//           <div className="mt-4 sm:mt-6 space-y-4">
//             {[
//               { title: "Welcome Bonus", desc: "Sign up for a new account", reward: "+5 USDT", type: "signup" },
//               { title: "First Deposit", desc: "Make your first deposit of ≥ 5 USDT", reward: "+10 USDT", type: "deposit" },
//               { title: "Price Floor Bonus", desc: "Claim both Welcome and First Deposit bonuses", reward: "+30 USDT", type: "priceFloor" },
//               { title: "First Trade", desc: "Make your first trade of ≥ 500 USDT", reward: "+20 USDT", type: "trade" },
//             ].map((task, index) => (
//               <div key={index} className="bg-gray-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <div className="flex-1">
//                   <div className="flex items-center flex-wrap">
//                     <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">{task.title}</span>
//                   </div>
//                   <div className="text-gray-600 mt-2 text-sm sm:text-base">{task.desc}</div>
//                 </div>
//                 <button
//                   onClick={() => handleClaimReward(task.reward.replace('+', ''), task.type)}
//                   className={`px-3 py-1.5 text-sm sm:text-base text-white rounded-xl transition-colors ${
//                     (task.type === 'signup' && signupBonusClaimed) || 
//                     (task.type === 'deposit' && depositBonusClaimed) || 
//                     (task.type === 'priceFloor' && priceFloorBonusClaimed)
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-black hover:bg-gray-800'
//                   }`}
//                   disabled={
//                     (task.type === 'signup' && signupBonusClaimed) || 
//                     (task.type === 'deposit' && depositBonusClaimed) || 
//                     (task.type === 'priceFloor' && priceFloorBonusClaimed)
//                   }
//                 >
//                   {((task.type === 'signup' && signupBonusClaimed) || 
//                     (task.type === 'deposit' && depositBonusClaimed) || 
//                     (task.type === 'priceFloor' && priceFloorBonusClaimed)) ? 'Claimed' : 'Claim'}
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="mt-8 sm:mt-12">
//             <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Reward Progress</h2>
//             <div className="relative">
//               <button onClick={scrollLeft} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
//                 <ChevronLeft className="w-5 h-5 text-black" />
//               </button>
//               <button onClick={scrollRight} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
//                 <ChevronRight className="w-5 h-5 text-black" />
//               </button>
//               <div ref={sliderRef} className="flex overflow-x-auto space-x-4 py-4 scrollbar-hide">
//                 {rewardAmounts.map((reward, index) => (
//                   <div key={index} className="flex-shrink-0 w-40 sm:w-48 bg-gray-200 rounded-lg p-4 text-center">
//                     <GiftIcon className="w-10 h-10 mx-auto mb-2 text-gray-600" />
//                     <div className="text-sm sm:text-base font-semibold text-black">{reward.amount}</div>
//                     <div className="text-xs text-gray-600 mt-1">{reward.unlocked ? "Unlocked" : "Locked"}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="mt-8 sm:mt-12">
//             <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">FAQ</h2>
//             <div className="space-y-4">
//               {faqItems.map((faq, index) => (
//                 <div key={index} className="border border-gray-400 rounded-lg">
//                   <button
//                     className="flex w-full items-center justify-between p-4 text-left"
//                     onClick={() => toggleFaq(index)}
//                   >
//                     <span className="text-sm sm:text-base font-medium text-black">{faq.question}</span>
//                     <FaChevronDown className={`w-4 h-4 text-black transform transition-transform ${expandedFaq === index ? "rotate-180" : ""}`} />
//                   </button>
//                   {expandedFaq === index && (
//                     <div className="p-4 text-sm text-gray-600 bg-gray-100">{faq.answer}</div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="mt-8 sm:mt-12">
//             <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Guides</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//               {guides.map((guide, index) => (
//                 <a key={index} href={guide.url} target="_blank" rel="noopener noreferrer" className="block">
//                   <div className="border border-gray-400 rounded-lg overflow-hidden">
//                     <img src={guide.image} alt={guide.title} className="w-full h-40 object-cover" />
//                     <div className="p-4">
//                       <div className="text-sm sm:text-base font-semibold text-black">{guide.title}</div>
//                     </div>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         localStorage.setItem('token', data.token);
//         Swal.fire({
//           icon: 'success',
//           title: 'Login successful',
//           timer: 1000,
//         });
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Login failed',
//           text: data.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
//         <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">Log In</h2>
//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter your email"
//             />
//           </div>
//           <div className="mb-6 relative">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter your password"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-10 text-gray-600"
//             >
//               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//             </button>
//           </div>
//           <button
//             type="submit"
//             className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base"
//           >
//             Log In
//           </button>
//         </form>
//         <div className="mt-4 text-center">
//           <Link to="/signup" className="text-sm text-black hover:underline">
//             Don't have an account? Sign Up
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SignupPage() {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [referralCode, setReferralCode] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, email, password, referralCode }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         localStorage.setItem('token', data.token);
//         Swal.fire({
//           icon: 'success',
//           title: 'Signup successful',
//           timer: 1000,
//         });
//         navigate('/assets');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Signup failed',
//           text: data.message,
//           confirmButtonColor: 'white',
//           confirmButtonText: '<span class="text-black">Ok</span>',
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Server error',
//         text: error.message,
//         confirmButtonColor: 'white',
//         confirmButtonText: '<span class="text-black">Ok</span>',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black flex items-center justify-center">
//       <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
//         <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">Sign Up</h2>
//         <form onSubmit={handleSignup}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter your username"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter your email"
//             />
//           </div>
//           <div className="mb-4 relative">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter your password"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-10 text-gray-600"
//             >
//               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//             </button>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Referral Code (Optional)</label>
//             <input
//               type="text"
//               value={referralCode}
//               onChange={(e) => setReferralCode(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
//               placeholder="Enter referral code"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base"
//           >
//             Sign Up
//           </button>
//         </form>
//         <div className="mt-4 text-center">
//           <Link to="/login" className="text-sm text-black hover:underline">
//             Already have an account? Log In
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


// export default function App() {
//     const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//     const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//     const [accountBalance, setAccountBalance] = useState(0);
  
//     const toggleDrawer = () => {
//       setIsDrawerOpen(!isDrawerOpen);
//     };
  
//     const handleLogout = () => {
//       localStorage.removeItem('token');
//       setIsLoggedIn(false);
//       setAccountBalance(0);
//     };
  
//     const updateBalance = (amount) => {
//       setAccountBalance((prevBalance) => prevBalance + parseFloat(amount));
//     };
  
//     return (
//       <Router>
//         <div className="min-h-screen bg-white">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
//             <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px" }}>
//               <div className="flex items-center justify-between h-16">
//                 <div className="flex items-center">
//                   <button onClick={toggleDrawer} className="sm:hidden p-2">
//                     <Menu className="w-6 h-6 text-black" />
//                   </button>
//                   <Link to="/">
//                     <img src="./public/22072203_6549945.jpg" className="h-10" alt="logo" />
//                   </Link>
//                 </div>
//                 <nav className="hidden sm:flex items-center space-x-4">
//                   {[
//                     { to: "/support", label: "Support" },
//                     { to: "/Earn", label: "Earn" },
//                     { to: "/Futures", label: "Futures" },
//                     { to: "/Spot", label: "Spot" },
//                     { to: "/assets", label: "Assets" },
//                     { to: "/tasks", label: "Tasks" },
//                     { to: "/withdraw", label: "Withdraw" },
//                   ].map((item) => (
//                     <NavLink
//                       key={item.to}
//                       to={item.to}
//                       className={({ isActive }) =>
//                         `text-sm font-medium ${
//                           isActive ? "text-black font-semibold" : "text-gray-600 hover:text-black"
//                         }`
//                       }
//                     >
//                       {item.label}
//                     </NavLink>
//                   ))}
//                 </nav>
//                 <div className="flex items-center space-x-4">
//                   {isLoggedIn ? (
//                     <>
//                       <span className="text-sm font-medium text-black">
//                         Balance: {accountBalance.toFixed(2)} USDT
//                       </span>
//                       <button
//                         onClick={handleLogout}
//                         className="text-sm font-medium text-black hover:text-gray-800"
//                       >
//                         <LogOut className="w-5 h-5 inline-block mr-1" />
//                         Log Out
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <Link
//                         to="/login"
//                         className="text-sm font-medium text-black hover:text-gray-800"
//                       >
//                         Log In
//                       </Link>
//                       <Link
//                         to="/signup"
//                         className="px-3 py-1.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
//                       >
//                         Sign Up
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </header>
  
//           {/* Drawer */}
//           <Drawer
//             isOpen={isDrawerOpen}
//             toggleDrawer={toggleDrawer}
//             isLoggedIn={isLoggedIn}
//             handleLogout={handleLogout}
//           />
  
//           {/* Main Content */}
//           <main className="pt-16">
//             <Routes>
//               <Route path="/" element={<LandingPage />} />
//               <Route path="/deposit" element={<DepositPage method={updateBalance} />} />
//               <Route path="/assets" element={<AssetsPage method={updateBalance} />} />
//               <Route path="/withdraw" element={<WithdrawPage method={updateBalance} />} />
//               <Route path="/tasks" element={<TasksPage method={updateBalance} />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/signup" element={<SignupPage />} />
//               <Route path="/support" element={<div>Support Page</div>} />
//               <Route path="/Earn" element={<div>Earn Page</div>} />
//               <Route path="/Futures" element={<div>Futures Page</div>} />
//               <Route path="/Spot" element={<div>Spot Page</div>} />
//             </Routes>
//           </main>
//         </div>
//       </Router>
//     );
//   }
