import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth, db, functions } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { claimReferralBonus } from './utils';
import { DollarSign, List, CheckCircle, Circle } from 'lucide-react';

function TasksPage({ updateBalance }) {
  const [tasks, setTasks] = useState([
    { id: 'signup', title: 'Sign Up Bonus', description: 'Sign up to receive a $5 bonus', reward: 5, status: 'pending' },
    { id: 'firstDeposit', title: 'First Deposit Bonus', description: 'Make your first deposit to receive a $10 bonus', reward: 10, status: 'pending' },
    { id: 'invite', title: 'Invite Friends', description: 'Invite friends to earn $2 per successful referral', reward: 2, count: 0, status: 'pending' },
  ]);
  const [referralBonus, setReferralBonus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setReferralBonus((userData.referralCount || 0) * 2 - (userData.claimedReferralBonus || 0));
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
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
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
      navigate('/assets');
    }
  };

  const handleClaim = async (taskId) => {
    setIsSaving(true);
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
        const success = await claimReferralBonus(setReferralBonus, navigate, 'Tasks');
        if (success) {
          const updatedData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
          newBalance = updatedData.balance || 0;
          updateData = {};
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === 'invite' ? { ...task, count: updatedData.referralCount || 0 } : task
            )
          );
        } else {
          setIsSaving(false);
          return;
        }
      } else {
        throw new Error('Reward not available or already claimed');
      }

      if (Object.keys(updateData).length > 0) {
        await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, updateData);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: 'claimed' }
              : task
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Reward Claimed',
          text: `New balance: ${newBalance.toFixed(2)} USDT`,
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
      }
      updateBalance();
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
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
        <div className="flex items-center space-x-2 relative z-10">
          <svg className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base sm:text-lg font-medium text-white">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
      <div className="mx-auto px-4 sm:px-6 max-w-3xl relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Tasks</h1>
          <NavLink
            to="/assets"
            className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-full hover:bg-purple-700 hover:bg-opacity-30 transition-colors border border-gray-700 border-opacity-20 shadow-md mt-3 sm:mt-0"
          >
            Go to Assets
          </NavLink>
        </div>
        <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl transform transition-all duration-500 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 mb-3 sm:mb-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 ${
                task.status === 'pending' ? 'cursor-pointer hover:bg-purple-800 hover:bg-opacity-30 transition-all duration-300' : ''
              }`}
              onClick={() => task.status === 'pending' && handleTaskClick(task.id)}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {task.status === 'claimed' ? (
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500" />
                ) : task.status === 'completed' ? (
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
                ) : (
                  <Circle className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-white text-sm sm:text-base">{task.title}</p>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {task.id === 'invite' ? `${task.description} (${task.count} referrals)` : task.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-purple-400">
                  {task.id === 'invite' ? `$${referralBonus.toFixed(2)} USDT` : `$${task.reward} USDT`}
                </p>
                {task.status === 'completed' && (
                  <button
                    onClick={() => handleClaim(task.id)}
                    className="bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium hover:bg-purple-700 hover:bg-opacity-90 transition-colors disabled:bg-gray-600 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving || (task.id === 'invite' && referralBonus <= 0)}
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

export default TasksPage;