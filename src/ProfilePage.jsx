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
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
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
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
    if (type === 'name') regex = /^[a-zA-Z\s]*$/;
    else if (type === 'phone') regex = /^[0-9]*$/;
    else if (type === 'password') regex = /^[!-~]*$/;
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
    if (pwd.length === 0) return true;
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
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size must be less than 2MB',
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        return;
      }
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleClaimReferralBonus = async () => {
    if (referralBonus <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Bonus Available',
        text: 'You have no referral bonus to claim',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Phone number must be at least 10 digits and contain only numbers',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }

    if (password && !validatePassword(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 8 characters, including uppercase, lowercase, number, and special character',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center font-poppins relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
        <div className="absolute inset-0 stars"></div>
        <div className="flex items-center space-x-2 relative z-10">
          <svg className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base sm:text-lg font-medium text-white font-poppins">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-orbitron">Profile</h1>
            <NavLink
              to="/assets"
              className="text-xs sm:text-sm text-white hover:text-blue-500 hover:underline transition-all duration-500 mt-3 sm:mt-0 font-poppins"
            >
              Back to Assets
            </NavLink>
          </div>
          <div className="bg-[#f0f8ff17] backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <User className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white font-orbitron">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={avatar || 'https://via.placeholder.com/64'}
                    alt="User Avatar"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-600 border-opacity-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarChange}
                    className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 text-xs sm:text-sm text-white font-poppins"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">Email</label>
                <input
                  type="text"
                  value={email}
                  disabled
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 text-xs sm:text-sm text-gray-400 cursor-not-allowed font-poppins"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(e.target.value, 'name', setName)}
                  placeholder="Enter your name"
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => handleInputChange(e.target.value, 'phone', setPhoneNumber)}
                  placeholder="Enter your phone number"
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange(e.target.value, 'password', setPassword)}
                  placeholder="Enter new password (optional)"
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                <p className="text-xs sm:text-sm font-medium text-gray-200 font-poppins">
                  Total Referrals: <span className="text-blue-500">{referralCount}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  <p className="text-xs sm:text-sm font-medium text-gray-200 font-poppins">
                    Referral Bonus: <span className="text-blue-500">{referralBonus.toFixed(2)} USDT</span>
                  </p>
                </div>
                <button
                  onClick={handleClaimReferralBonus}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-gradient-to-r from-gray-700 to-blue-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins border border-gray-600 border-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={isSaving || referralBonus <= 0}
                >
                  <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" />
                  Claim Referral Bonus
                </button>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                <p className="text-xs sm:text-sm font-medium text-gray-200 font-poppins">
                  Last Login: <span className="text-blue-500">{formatDate(lastLogin)}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                <p className="text-xs sm:text-sm font-medium text-gray-200 font-poppins">
                  Account Status: <span className="text-blue-500 capitalize">{accountStatus}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 flex items-center justify-center text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <Save className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-white" />
                  Save Profile
                </>
              )}
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

export default ProfilePage;