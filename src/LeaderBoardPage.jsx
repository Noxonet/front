import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, rtdb } from "./firebase";
import { ref, get } from "firebase/database";
import Swal from "sweetalert2";
import { User } from "lucide-react";

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 30; // تعداد کاربران در هر صفحه
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }
      try {
        const usersRef = ref(rtdb, "users");
        const snapshot = await get(usersRef);
        let usersList = [];

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          usersList = Object.keys(usersData).map((userId) => ({
            id: userId,
            name:
              usersData[userId].name && usersData[userId].name.trim()
                ? usersData[userId].name
                : "Anonymous User",
            avatar:
              usersData[userId].avatar && usersData[userId].avatar.trim()
                ? usersData[userId].avatar
                : "https://ui-avatars.com/api/?name=Anonymous&size=64",
            balance: Number(usersData[userId].balance) || 0,
          }));
          const sortedUsers = usersList.sort((a, b) => b.balance - a.balance);
          setUsers(sortedUsers);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        Swal.fire({
          icon: "error",
          title: "Error Fetching Leaderboard",
          text: error.message,
          confirmButtonColor: "#1E3A8A",
          confirmButtonText: "OK",
          customClass: {
            popup:
              "bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]",
            title: "text-lg sm:text-xl font-bold text-white font-orbitron",
            content: "text-gray-200 text-sm sm:text-base font-poppins",
            confirmButton:
              "bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [navigate]);

  // محاسبه کاربران برای صفحه فعلی
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // تغییر صفحه
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center font-poppins relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
        <div className="absolute inset-0 stars"></div>
        <div className="flex items-center space-x-2 relative z-10">
          <svg
            className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-base sm:text-lg font-medium text-white font-poppins">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-orbitron">
            Leaderboard
          </h1>
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white font-orbitron">
              Top Users by Balance
            </h2>
          </div>
          {users.length === 0 ? (
            <p className="text-center text-xs sm:text-sm text-gray-200 font-poppins">
              No users found.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {currentUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#f0f8ff0a] backdrop-blur-sm rounded-lg border border-gray-600 border-opacity-30 hover:bg-[#f0f8ff17] transition-all duration-300"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-200 font-poppins">
                      #{indexOfFirstUser + index + 1}
                    </span>
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s Avatar`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-600 border-opacity-50"
                      onError={(e) => {
                        e.target.src =
                          "https://ui-avatars.com/api/?name=Anonymous&size=64";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-white font-poppins">
                        {user.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-200 font-poppins">
                        Balance:{" "}
                        <span className="text-blue-500">
                          ${user.balance.toFixed(2)} USDT
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 font-poppins ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-700 to-blue-900 text-white hover:shadow-[0_0_12px_rgba(30,58,138,0.5)]"
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 font-poppins ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 font-poppins ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-700 to-blue-900 text-white hover:shadow-[0_0_12px_rgba(30,58,138,0.5)]"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
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
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              2px 2px at 20px 30px,
              #fff 1px,
              transparent 0
            ),
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
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}

export default LeaderboardPage;
