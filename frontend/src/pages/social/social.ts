export function renderSocial() {
  return `
    <div class="social-page">
      <div class="social-container">
        <div class="social-header">
          <h1>Social</h1>
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search friends...">
          </div>
        </div>

        <div class="social-content">
          <div class="friends-section">
            <div class="section-header">
              <h2>Friends</h2>
              <button class="add-friend-btn">
                <i class="fas fa-user-plus"></i>
                Add Friend
              </button>
            </div>
            
            <div class="friends-list">
              <div class="friend-item online">
                <img src="../../public/avatar.png" alt="Friend Avatar" class="friend-avatar">
                <div class="friend-info">
                  <span class="friend-name">Player123</span>
                  <span class="friend-status">Online</span>
                </div>
                <div class="friend-actions">
                  <button class="friend-action-btn message">
                    <i class="fas fa-comment"></i>
                  </button>
                  <button class="friend-action-btn play">
                    <i class="fas fa-gamepad"></i>
                  </button>
                </div>
              </div>

              <div class="friend-item offline">
                <img src="../../public/avatar.png" alt="Friend Avatar" class="friend-avatar">
                <div class="friend-info">
                  <span class="friend-name">Player456</span>
                  <span class="friend-status">Offline</span>
                </div>
                <div class="friend-actions">
                  <button class="friend-action-btn message">
                    <i class="fas fa-comment"></i>
                  </button>
                  <button class="friend-action-btn play" disabled>
                    <i class="fas fa-gamepad"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="invitations-section">
            <h2>Friend Requests</h2>
            <div class="invitations-list">
              <div class="invitation-item">
                <img src="../../public/avatar.png" alt="User Avatar" class="invitation-avatar">
                <div class="invitation-info">
                  <span class="invitation-name">Player789</span>
                  <span class="invitation-time">2 hours ago</span>
                </div>
                <div class="invitation-actions">
                  <button class="invitation-btn accept">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="invitation-btn decline">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-section">
            <div class="chat-header">
              <h2>Chat</h2>
              <button class="new-chat-btn">
                <i class="fas fa-plus"></i>
                New Chat
              </button>
            </div>
            
            <div class="chat-list">
              <div class="chat-item active">
                <img src="../../public/avatar.png" alt="Chat Avatar" class="chat-avatar">
                <div class="chat-info">
                  <span class="chat-name">Player123</span>
                  <span class="chat-last-message">Hey, want to play a game?</span>
                </div>
                <span class="chat-time">2m ago</span>
              </div>

              <div class="chat-item">
                <img src="../../public/avatar.png" alt="Chat Avatar" class="chat-avatar">
                <div class="chat-info">
                  <span class="chat-name">Player456</span>
                  <span class="chat-last-message">Good game!</span>
                </div>
                <span class="chat-time">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .social-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        overflow-y: auto;
      }

      .social-container {
        width: 95%;
        max-width: 1200px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: fadeIn 0.5s ease-out;
        margin: 20px 0;
      }

      .social-header {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
      }

      .social-header h1 {
        font-size: 1.8em;
        margin: 0;
        text-align: center;
      }

      .search-bar {
        display: flex;
        align-items: center;
        padding: 8px 15px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.05);
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
      }

      .search-bar i {
        color: #ccc;
        margin-right: 10px;
      }

      .search-bar input {
        background: none;
        border: none;
        color: white;
        outline: none;
        font-size: 0.9em;
        width: 100%;
      }

      .search-bar input::placeholder {
        color: #ccc;
      }

      .social-content {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .section-header h2 {
        margin: 0;
        font-size: 1.3em;
      }

      .add-friend-btn, .new-chat-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        border: none;
        border-radius: 10px;
        background: #4a90e2;
        color: white;
        transition: all 0.3s ease;
        font-size: 0.9em;
        white-space: nowrap;
      }

      .add-friend-btn:hover, .new-chat-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .friends-list, .invitations-list, .chat-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .friend-item, .invitation-item, .chat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        color: white;
      }

      .friend-avatar, .invitation-avatar, .chat-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .friend-info, .invitation-info, .chat-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .friend-name, .invitation-name, .chat-name {
        font-weight: 600;
        font-size: 0.95em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .friend-status, .invitation-time, .chat-time {
        font-size: 0.85em;
        color: #ccc;
      }

      .friend-actions, .invitation-actions {
        display: flex;
        gap: 8px;
      }

      .friend-action-btn, .invitation-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .friend-action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .friend-action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .friend-item.online .friend-status {
        color: #2ecc71;
      }

      .invitation-btn.accept {
        background: #2ecc71;
      }

      .invitation-btn.decline {
        background: #e74c3c;
      }

      .invitation-btn:hover {
        transform: scale(1.1);
      }

      .chat-item {
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .chat-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .chat-item.active {
        background: rgba(74, 144, 226, 0.2);
      }

      .chat-last-message {
        font-size: 0.85em;
        color: #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
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

      /* Desktop Layout */
      @media (min-width: 1024px) {
        .social-container {
          padding: 30px;
        }

        .social-header {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .social-header h1 {
          text-align: left;
        }

        .search-bar {
          margin: 0;
        }

        .social-content {
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .chat-section {
          grid-column: 1 / -1;
        }
      }

      /* Tablet Layout */
      @media (min-width: 768px) and (max-width: 1023px) {
        .social-container {
          padding: 25px;
        }

        .social-content {
          gap: 25px;
        }
      }

      /* Mobile Layout */
      @media (max-width: 767px) {
        .social-container {
          padding: 15px;
        }

        .social-header h1 {
          font-size: 1.5em;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .add-friend-btn, .new-chat-btn {
          width: 100%;
          justify-content: center;
        }

        .friend-item, .invitation-item, .chat-item {
          padding: 10px;
        }

        .friend-avatar, .invitation-avatar, .chat-avatar {
          width: 35px;
          height: 35px;
        }

        .friend-action-btn, .invitation-btn {
          width: 28px;
          height: 28px;
        }
      }

      /* Small Mobile Layout */
      @media (max-width: 480px) {
        .social-page {
          padding: 10px;
        }

        .social-container {
          padding: 12px;
        }

        .social-header h1 {
          font-size: 1.3em;
        }

        .friend-name, .invitation-name, .chat-name {
          font-size: 0.9em;
        }

        .friend-status, .invitation-time, .chat-time {
          font-size: 0.8em;
        }

        .chat-last-message {
          max-width: 150px;
        }
      }
    </style>
  `;
}
