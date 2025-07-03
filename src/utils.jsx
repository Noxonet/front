import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import Swal from 'sweetalert2';

export const claimReferralBonus = async (setReferralBonus, navigate, pageName = 'Page') => {
  try {
    const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
    if (!userData) {
      throw new Error('User data not found');
    }
    const bonusToClaim = (userData.referralCount || 0) * 2 - (userData.claimedReferralBonus || 0);
    if (bonusToClaim <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Bonus Available',
        text: 'You have no referral bonus to claim',
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-gray-900',
          content: 'text-gray-700 text-sm sm:text-base',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      return false;
    }

    await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, {
      balance: (userData.balance || 0) + bonusToClaim,
      claimedReferralBonus: (userData.claimedReferralBonus || 0) + bonusToClaim,
    });

    setReferralBonus(0);
    Swal.fire({
      icon: 'success',
      title: 'Referral Bonus Claimed',
      text: `$${bonusToClaim.toFixed(2)} added to your balance from ${pageName}`,
      timer: 2000,
      confirmButtonColor: '#1f2937',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-white shadow-2xl rounded-lg animate-fade-in max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-gray-900',
        content: 'text-gray-700 text-sm sm:text-base',
        confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
      },
    });
    return true;
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
      title: 'Claim Error',
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
    return false;
  }
};