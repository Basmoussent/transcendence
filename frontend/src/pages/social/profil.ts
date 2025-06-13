export function renderProfil() {
  return `
    <div class="profile-page">
      <div class="background-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="../../public/avatar.png" alt="Profile Avatar" class="avatar-image">
            <button class="change-avatar-btn">
              <i class="fas fa-camera"></i>
            </button>
          </div>
          <div class="profile-info">
            <h1 class="username">Username</h1>
            <p class="email">email@example.com</p>
            <div class="status online">
              <i class="fas fa-circle"></i> Online
            </div>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <i class="fas fa-trophy"></i>
            <div class="stat-info">
              <span class="stat-value">42</span>
              <span class="stat-label">Wins</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-gamepad"></i>
            <div class="stat-info">
              <span class="stat-value">156</span>
              <span class="stat-label">Games</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-info">
              <span class="stat-value">3.5</span>
              <span class="stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="action-button edit-profile">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
          <button class="action-button change-password">
            <i class="fas fa-key"></i>
            Change Password
          </button>
          <button class="action-button logout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div class="recent-activity">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <i class="fas fa-gamepad"></i>
              <div class="activity-info">
                <span class="activity-text">Won against Player123</span>
                <span class="activity-time">2 hours ago</span>
              </div>
            </div>
            <div class="activity-item">
              <i class="fas fa-user-plus"></i>
              <div class="activity-info">
                <span class="activity-text">Added new friend: Player456</span>
                <span class="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .profile-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px 20px;
        position: relative;
        overflow: hidden;
      }

      .background-circles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
      }

      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(5px);
      }

      .circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        left: -100px;
        background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.1) 100%);
      }

      .circle-2 {
        width: 200px;
        height: 200px;
        top: 50%;
        right: -50px;
        background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
      }

      .circle-3 {
        width: 250px;
        height: 250px;
        bottom: -100px;
        left: 20%;
        background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
      }

      .circle-4 {
        width: 150px;
        height: 150px;
        top: 20%;
        left: 30%;
        background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%);
      }

      .profile-container {
        position: relative;
        z-index: 2;
        max-width: 800px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: fadeIn 0.5s ease-out;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-bottom: 40px;
      }

      .profile-avatar {
        position: relative;
      }

      .avatar-image {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.2);
      }

      .change-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #4a90e2;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .change-avatar-btn:hover {
        transform: scale(1.1);
      }

      .profile-info {
        color: white;
      }

      .username {
        font-size: 2.5em;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .email {
        color: #ccc;
        margin: 5px 0;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.9em;
      }

      .status.online {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }

      .profile-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 40px;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        color: white;
      }

      .stat-card i {
        font-size: 2em;
        color: #4a90e2;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 1.5em;
        font-weight: bold;
      }

      .stat-label {
        color: #ccc;
        font-size: 0.9em;
      }

      .profile-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 40px;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
      }

      .edit-profile {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      }

      .change-password {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      }

      .logout {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      }

      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .recent-activity {
        color: white;
      }

      .recent-activity h2 {
        margin-bottom: 20px;
        font-size: 1.5em;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }

      .activity-item i {
        font-size: 1.2em;
        color: #4a90e2;
      }

      .activity-info {
        display: flex;
        flex-direction: column;
      }

      .activity-time {
        color: #ccc;
        font-size: 0.9em;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          text-align: center;
        }

        .profile-stats {
          grid-template-columns: 1fr;
        }

        .profile-actions {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
