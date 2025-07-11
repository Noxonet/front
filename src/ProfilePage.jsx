import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth, storage } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword } from 'firebase/auth';
import { User, Save, Calendar, Users, DollarSign, Activity, Shield } from 'lucide-react';

function ProfilePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null); // URL تصویر یا null
  const [avatarFile, setAvatarFile] = useState(null); // فایل انتخاب‌شده
  const [referralCount, setReferralCount] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);
  const [lastLogin, setLastLogin] = useState(null);
  const [accountStatus, setAccountStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }
      try {
        const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        if (!userData) {
          throw new Error('User data not found');
        }
        setEmail(userData.email || '');
        setName(userData.name || '');
        setPhoneNumber(userData.phoneNumber || '');
        setAvatar(userData.avatar || null);
        setReferralCount(userData.referralCount || 0);
        setReferralBonus((userData.referralCount || 0) * 2 - (userData.claimedReferralBonus || 0));
        setLastLogin(userData.lastLogin || Date.now());
        setAccountStatus(userData.accountStatus || 'active');
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
          title: 'Error Fetching Profile',
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
    fetchUserData();
  }, [navigate]);

  const restrictToEnglish = (value, type) => {
    let regex;
    if (type === 'name') regex = /^[a-zA-Z\s]*$/; // فقط حروف انگلیسی و فاصله
    else if (type === 'phone') regex = /^[0-9]*$/; // فقط اعداد
    else if (type === 'password') regex = /^[!-~]*$/; // فقط کاراکترهای ASCII
    return regex.test(value);
  };

  const handleInputChange = (value, type, setter) => {
    if (!restrictToEnglish(value, type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text:
          type === 'name'
            ? 'Only English letters and spaces are allowed'
            : type === 'phone'
            ? 'Only numbers are allowed'
            : 'Only English characters are allowed',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }
    setter(value);
  };

  const validatePhoneNumber = (phone) => {
    return phone.length === 0 || (phone.length >= 10 && /^[0-9]+$/.test(phone));
  };

  const validatePassword = (pwd) => {
    if (pwd.length === 0) return true; // رمز عبور اختیاری است
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*]/.test(pwd)
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Only JPEG or PNG images are allowed',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // حداکثر 2MB
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size must be less than 2MB',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
        return;
      }
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file)); // پیش‌نمایش تصویر
    }
  };

  const handleClaimReferralBonus = async () => {
    if (referralBonus <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Bonus Available',
        text: 'You have no referral bonus to claim',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
      if (!userData) {
        throw new Error('User data not found');
      }
      const bonusToClaim = (userData.referralCount || 0) * 2 - (userData.claimedReferralBonus || 0);
      await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, {
        balance: (userData.balance || 0) + bonusToClaim,
        claimedReferralBonus: (userData.claimedReferralBonus || 0) + bonusToClaim,
      });
      setReferralBonus(0);
      Swal.fire({
        icon: 'success',
        title: 'Referral Bonus Claimed',
        text: `$${bonusToClaim.toFixed(2)} added to your balance`,
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
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
        title: 'Claim Error',
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

  const handleSaveProfile = async () => {
    if (!name) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Name is required',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Phone number must be at least 10 digits and contain only numbers',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    if (password && !validatePassword(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 8 characters, including uppercase, lowercase, number, and special character',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl = avatar;
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
      }

      const updates = {
        name: name || null,
        phoneNumber: phoneNumber || null,
        avatar: avatarUrl,
      };
      await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, updates);

      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been successfully updated',
        timer: 2000,
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      setPassword('');
      setAvatarFile(null);
    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API secret, please contact support';
        localStorage.removeItem('token');
        auth.signOut();
        navigate('/login');
      } else if (error.message.includes('requires-recent-login')) {
        errorMessage = 'Please log out and log in again to update your password';
        navigate('/login');
      }
      Swal.fire({
        icon: 'error',
        title: 'Save Error',
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Profile</h1>
            <NavLink
              to="/assets"
              className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-full hover:bg-gray-800 hover:bg-opacity-30 transition-colors border border-gray-700 border-opacity-20 shadow-md mt-3 sm:mt-0"
            >
              Back to Assets
            </NavLink>
          </div>
          <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <User className="w-6 sm:w-8 h-6 sm:h-8 text-gray-300" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={avatar || 'https://via.placeholder.com/64'}
                    alt="User Avatar"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-700 border-opacity-20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarChange}
                    className="w-full p-2 sm:p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 text-xs sm:text-sm text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Email</label>
                <input
                  type="text"
                  value={email}
                  disabled
                  className="w-full p-2 sm:p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 text-xs sm:text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(e.target.value, 'name', setName)}
                  placeholder="Enter your name"
                  className="w-full p-2 sm:p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => handleInputChange(e.target.value, 'phone', setPhoneNumber)}
                  placeholder="Enter your phone number"
                  className="w-full p-2 sm:p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange(e.target.value, 'password', setPassword)}
                  placeholder="Enter new password (optional)"
                  className="w-full p-2 sm:p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-xs sm:text-sm text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
              <div className="flex items-center gap-2">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                <p className="text-xs sm:text-sm font-medium text-gray-300">
                  Total Referrals: <span className="text-purple-400">{referralCount}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                  <p className="text-xs sm:text-sm font-medium text-gray-300">
                    Referral Bonus: <span className="text-purple-400">{referralBonus.toFixed(2)} USDT</span>
                  </p>
                </div>
                <button
                  onClick={handleClaimReferralBonus}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors disabled:bg-gray-600 disabled:bg-opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
                  disabled={isSaving || referralBonus <= 0}
                >
                  <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" />
                  Claim Referral Bonus
                </button>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                <p className="text-xs sm:text-sm font-medium text-gray-300">
                  Last Login: <span className="text-purple-400">{formatDate(lastLogin)}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                <p className="text-xs sm:text-sm font-medium text-gray-300">
                  Account Status: <span className="text-purple-400 capitalize">{accountStatus}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-2 sm:p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors flex items-center justify-center text-xs sm:text-sm mt-4 sm:mt-6 disabled:bg-gray-600 disabled:bg-opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
              disabled={isSaving}
            >
              {isSaving ? (
                <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Save className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-gray-300" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;