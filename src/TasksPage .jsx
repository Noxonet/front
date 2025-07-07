import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth ,db,functions} from './firebase';
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
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-gray-900',
            content: 'text-gray-700 text-sm sm:text-base',
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
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-gray-900',
            content: 'text-gray-700 text-sm sm:text-base',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
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
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-gray-800" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base sm:text-lg font-medium text-gray-800">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <div className="mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Tasks</h1>
          <NavLink
            to="/assets"
            className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-transparent text-gray-800 text-xs sm:text-sm font-medium rounded-full hover:bg-gray-200 transition-colors border border-gray-300 shadow-md mt-3 sm:mt-0"
          >
            Go to Assets
          </NavLink>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl animate-fade-in">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 mb-3 sm:mb-4 bg-gray-50 rounded-lg ${
                task.status === 'pending' ? 'cursor-pointer hover:bg-gray-100 transition-all duration-300' : ''
              }`}
              onClick={() => task.status === 'pending' && handleTaskClick(task.id)}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {task.status === 'claimed' ? (
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500" />
                ) : task.status === 'completed' ? (
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500" />
                ) : (
                  <Circle className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{task.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {task.id === 'invite' ? `${task.description} (${task.count} referrals)` : task.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-yellow-500">
                  {task.id === 'invite' ? `$${referralBonus.toFixed(2)} USDT` : `$${task.reward} USDT`}
                </p>
                {task.status === 'completed' && (
                  <button
                    onClick={() => handleClaim(task.id)}
                    className="bg-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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