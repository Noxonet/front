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
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="flex flex-col min-h-screen relative z-10">
        <main className="flex flex-1 flex-col">
          <div className="relative">
            <div className="flex mx-auto px-4 sm:px-6" style={{ maxWidth: "1248px", minHeight: "300px", paddingTop: "60px", paddingBottom: "60px" }}>
              <div className="flex flex-col justify-center items-start">
                <div style={{ maxWidth: "560px" }}>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white font-orbitron leading-tight sm:leading-snug md:leading-[56px] mb-2 sm:mb-4">
                    Quantum: Your Gateway into Web3
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-200 font-poppins">
                    Trading in cryptoassets involves a high degree of risk and may not be suitable for all investors. The value of cryptoassets can be extremely volatile and unpredictable, and can fluctuate significantly in a short period of time. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before trading in cryptoassets. Always trade responsibly and never invest more than you can afford to lose.
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Link to="/tasks" className="inline-flex items-center justify-center cursor-pointer text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-700 to-blue-900 text-white rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins border border-gray-600 border-opacity-50">
                      Claim Reward
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="py-4 sm:py-6">
            <div className="mx-auto px-4 sm:px-6 bg-[#f0f8ff17] backdrop-blur-lg border border-gray-600 border-opacity-50 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] max-w-full">
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed font-poppins">
                <strong className="block font-bold text-white font-orbitron">
                  ⚠️ Important Notice: Advanced Trading Platform
                </strong>
                <div className="text-gray-200 mt-2 font-poppins">
                  Quantum Exchange offers advanced trading features designed for experienced traders. Our platform provides access to spot trading, futures, and advanced order types. Please ensure you understand the risks involved before using leverage or derivative products.
                </div>
              </div>
            </div>
          </div>
          <div className="py-6 sm:py-8">
            <div className="mx-auto px-4 sm:px-6 max-w-full">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="mb-6 sm:mb-8">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white font-orbitron">
                      Get Started
                    </div>
                  </div>
                  <div>
                    {[
                      { icon: <MdOutlineAccountBox className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" />, title: "Step 1: Create & Verify Account", desc: "Sign up for your Quantum account and complete identity verification to access all trading features and ensure platform security." },
                      { icon: <MdAssessment className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" />, title: "Step 2: Complete Trading Assessment", desc: "Take our trading knowledge assessment to unlock advanced features and ensure you understand the risks of cryptocurrency trading." },
                      { icon: <RiFundsFill className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" />, title: "Step 3: Fund & Start Trading", desc: "Deposit funds using multiple payment methods and start trading with advanced order types, leverage, and professional tools." },
                    ].map((step, index) => (
                      <div key={index} className="flex mb-6 sm:mb-8">
                        <div className="flex items-start justify-center">
                          {step.icon}
                        </div>
                        <div className="flex-1 ml-3 sm:ml-4">
                          <div className="text-base sm:text-lg md:text-xl font-semibold text-white font-orbitron mb-1">{step.title}</div>
                          <div className="text-xs sm:text-sm text-gray-200 font-poppins">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center order-2 my-4 md:my-0">
                  <img src="./public/AdobeStock_1531277087_Preview.jpeg" className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-full h-auto" loading="lazy" alt="phone chart" />
                </div>
              </div>
            </div>
          </div>
          <div className="py-4 sm:py-6">
            <div className="mx-auto px-4 sm:px-6 max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "24/7 Live Support", desc: "Get instant help from our expert support team available around the clock for all your trading needs.", icon: <LuHeadset className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" /> },
                  { title: "Trading Guides", desc: "Access comprehensive guides and tutorials to master cryptocurrency trading strategies.", icon: <IoMdChatboxes className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" /> },
                  { title: "Market News", desc: "Stay updated with the latest cryptocurrency market news, analysis, and insights from industry experts.", icon: <IoDocuments className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" /> },
                  { title: "API Documentation", desc: "Integrate with our powerful API for algorithmic trading, portfolio management, and custom applications.", icon: <GrDocumentText className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white" /> },
                ].map((card, index) => (
                  <Link key={index} to="#" className="flex flex-col p-3 sm:p-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition-all duration-500" style={{ textDecoration: "none" }}>
                    {card.icon}
                    <div className="mt-3">
                      <div className="font-medium text-white text-sm sm:text-base font-orbitron">{card.title}</div>
                      <div className="text-gray-200 text-xs sm:text-sm mt-1 font-poppins">{card.desc}</div>
                    </div>
                    <button className="mt-4 bg-gradient-to-r from-gray-700 to-blue-900 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins border border-gray-600 border-opacity-50">
                      {card.title === "24/7 Live Support" ? "Contact Support" : card.title === "Trading Guides" ? "Learn More" : card.title === "Market News" ? "Read News" : "View Docs"}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
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
      `}</style>
    </div>
  );
}

function Earn() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4 text-center">Earn</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">Stake your assets to earn passive income or participate in yield farming.</p>
          <div className="bg-[#f0f8ff17] backdrop-blur-lg rounded-lg p-3 sm:p-4 border border-gray-600 border-opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            <h3 className="text-base sm:text-lg font-medium text-white font-orbitron mb-2">Earning Options</h3>
            <p className="text-xs sm:text-sm text-gray-200 font-poppins">This feature is under development. Stay tuned for staking and farming opportunities.</p>
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
      `}</style>
    </div>
  );
}

function Futures() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4 text-center">Futures</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">Trade futures contracts with leverage to maximize your trading potential.</p>
          <div className="bg-[#f0f8ff17] backdrop-blur-lg rounded-lg p-3 sm:p-4 border border-gray-600 border-opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            <h3 className="text-base sm:text-lg font-medium text-white font-orbitron mb-2">Futures Trading</h3>
            <p className="text-xs sm:text-sm text-gray-200 font-poppins">This feature is under development. Check back later for futures trading options.</p>
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
      `}</style>
    </div>
  );
}

function Spot() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4 text-center">Spot</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">Trade cryptocurrencies directly on our spot market with low fees.</p>
          <div className="bg-[#f0f8ff17] backdrop-blur-lg rounded-lg p-3 sm:p-4 border border-gray-600 border-opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            <h3 className="text-base sm:text-lg font-medium text-white font-orbitron mb-2">Spot Trading</h3>
            <p className="text-xs sm:text-sm text-gray-200 font-poppins">This feature is under development. Stay tuned for spot trading capabilities.</p>
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
      `}</style>
    </div>
  );
}

function NotAvailable() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4">Sorry</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">We can't provide this page right now</p>
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
      `}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4">Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">There is no route matching the URL</p>
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
      `}</style>
    </div>
  );
}

function Support() {
  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins text-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron mb-4 text-center">Support</h2>
          <p className="text-xs sm:text-sm text-gray-200 mb-3 font-poppins">Get help with your account or trading issues from our support team.</p>
          <div className="bg-[#f0f8ff17] backdrop-blur-lg rounded-lg p-3 sm:p-4 border border-gray-600 border-opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            <h3 className="text-base sm:text-lg font-medium text-white font-orbitron mb-2">Contact Support</h3>
            <p className="text-xs sm:text-sm text-gray-200 font-poppins">Reach out to our 24/7 support team via email: support@quantumexchange.com</p>
            <button
              onClick={() => Swal.fire({
                icon: 'info',
                title: 'Support',
                text: 'Email us at support@quantumexchange.com for assistance.',
                confirmButtonColor: '#1E3A8A',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
                  title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
                  content: 'text-gray-200 text-sm sm:text-base font-poppins',
                  confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
                },
              })}
              className="mt-3 bg-gradient-to-r from-gray-700 to-blue-900 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins border border-gray-600 border-opacity-50"
            >
              Contact Now
            </button>
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
      `}</style>
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
        className={`fixed top-0 left-0 h-full w-3/4 bg-[#f0f8ff17] backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] z-50 transform transition-all duration-500 sm:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-600 border-opacity-50">
            <Link to="/" onClick={toggleDrawer} className="flex items-center space-x-2">
              <img src='./public/atomic.png' className="h-8 w-8 rounded-full" alt="logo" />
              <span className="text-base sm:text-lg font-bold text-white font-orbitron">Quantum</span>
            </Link>
            <button onClick={toggleDrawer} className="p-2">
              <X className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col p-3 sm:p-4 space-y-2">
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
                className="text-white text-sm sm:text-base font-medium py-2 px-3 rounded-md hover:bg-[#f0f8ff17] hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins"
                onClick={toggleDrawer}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 sm:p-4 border-t border-gray-600 border-opacity-50">
            {isLoggedIn ? (
              <button 
                onClick={() => { handleLogout(); toggleDrawer(); }} 
                className="block text-white text-sm sm:text-base font-medium py-2 px-3 rounded-md hover:bg-[#f0f8ff17] hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-white text-sm sm:text-base font-medium py-2 px-3 rounded-md hover:bg-[#f0f8ff17] hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins mb-2"
                  onClick={toggleDrawer}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="block bg-gradient-to-r from-gray-700 to-blue-900 text-white text-sm sm:text-base font-medium py-2 px-3 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins text-center"
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
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Logout Error',
        text: error.message,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <header className="bg-[#f0f8ff17] backdrop-blur-lg text-white fixed top-0 left-0 right-0 z-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border-b border-gray-600 border-opacity-50">
        <div className="mx-auto px-4 sm:px-6 max-w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="sm:hidden p-2 rounded-md hover:bg-[#f0f8ff17] hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500"
              >
                <Menu className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <img src='./public/atomic.png' className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" alt="logo" />
                <span className="text-base sm:text-lg lg:text-xl font-bold text-white font-orbitron">Quantum</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
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
                    `text-xs sm:text-sm font-medium transition-all duration-500 font-poppins ${
                      isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-200 hover:text-blue-400 hover:shadow-[0_0_12px_rgba(30,58,138,0.5)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 bg-[#f0f8ff17] backdrop-blur-lg px-2 sm:px-3 py-1 rounded-full border border-gray-600 border-opacity-50">
                    <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white font-poppins">{balance.toFixed(2)} USDT</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-200 hover:text-blue-400 transition-all duration-500 font-poppins"
                  >
                    <LogOut className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs sm:text-sm font-medium text-gray-200 hover:text-blue-400 transition-all duration-500 font-poppins">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-gray-700 to-blue-900 text-white text-xs sm:text-sm font-medium rounded-full hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins border border-gray-600 border-opacity-50"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <Drawer 
          isOpen={isDrawerOpen} 
          toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)} 
          isLoggedIn={isLoggedIn} 
          handleLogout={handleLogout} 
        />
      </header>
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<AssetsPage updateBalance={updateBalance} />} />
          <Route path="/assets" element={<AssetsPage updateBalance={updateBalance} />} />
          <Route path="/deposit" element={<DepositPage updateBalance={updateBalance} />} />
          <Route path="/withdraw" element={<WithdrawPage updateBalance={updateBalance} />} />
          <Route path="/tasks" element={<TasksPage updateBalance={updateBalance} />} />
          <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} setBalance={setBalance} updateBalance={updateBalance} />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setBalance={setBalance} updateBalance={updateBalance} />} />
          <Route path="/support" element={<Support />} />
          <Route path="/Earn" element={<BotActivationPage />} />
          <Route path="/Futures" element={<Futures />} />
          <Route path="/Spot" element={<Spot />} />
          <Route path="/transfer" element={<NotAvailable />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/prop" element={<PropPurchase />} />
          <Route path="/bots" element={<BotActivationPage />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
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
      `}</style>
    </div>
  );
}

export default App;