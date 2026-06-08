// 游戏功能模块

// 签到系统
const CheckinSystem = {
  checkinStatus: {
    todayChecked: false,
    streak: 5,
    totalCheckins: 15
  },
  rewards: [
    { day: 1, reward: '灵石 x 1000, 聚气丹 x 2' },
    { day: 2, reward: '灵石 x 2000, 聚气丹 x 3' },
    { day: 3, reward: '灵石 x 3000, 聚气丹 x 5' },
    { day: 4, reward: '灵石 x 5000, 聚气丹 x 8' },
    { day: 5, reward: '灵石 x 10000, 聚气丹 x 10' },
    { day: 6, reward: '灵石 x 15000, 聚气丹 x 15' },
    { day: 7, reward: '灵石 x 20000, 聚气丹 x 20, 随机功法 x 1' }
  ],
  openCheckinPopup() {
    const popup = document.getElementById('checkinPopup');
    const content = document.getElementById('checkinContent');
    
    let html = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 1.1rem; margin-bottom: 10px;">当前连续签到: <span style="color: var(--gold-primary); font-weight: bold;">${this.checkinStatus.streak}</span> 天</div>
        <div style="font-size: 0.9rem; color: var(--text-dim);">累计签到: ${this.checkinStatus.totalCheckins} 天</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 20px;">
    `;
    
    this.rewards.forEach((reward, index) => {
      const isChecked = index < this.checkinStatus.streak;
      const isToday = index === this.checkinStatus.streak;
      
      html += `
        <div style="
          background: ${isChecked ? 'rgba(76, 175, 80, 0.2)' : isToday ? 'rgba(230, 199, 73, 0.2)' : 'rgba(30, 35, 55, 0.6)'};
          border: 1px solid ${isChecked ? 'var(--success)' : isToday ? 'var(--gold-primary)' : 'rgba(230, 199, 73, 0.3)'};
          border-radius: 8px;
          padding: 10px 5px;
          text-align: center;
          position: relative;
        ">
          <div style="font-size: 0.8rem; font-weight: bold; color: ${isChecked ? 'var(--success)' : isToday ? 'var(--gold-primary)' : 'var(--text-dim)'};">第${reward.day}天</div>
          <div style="font-size: 0.6rem; color: var(--text-dim); margin: 5px 0;">${reward.reward}</div>
          ${isChecked ? '<div style="position: absolute; top: 5px; right: 5px; font-size: 0.8rem; color: var(--success);">✓</div>' : ''}
        </div>
      `;
    });
    
    html += `</div>`;
    
    if (!this.checkinStatus.todayChecked) {
      html += `
        <button class="popup-btn" onclick="CheckinSystem.checkin()" style="margin-top: 10px;">
          今日签到
        </button>
      `;
    } else {
      html += `
        <div style="text-align: center; padding: 15px; background: rgba(76, 175, 80, 0.2); border-radius: 8px; margin-top: 10px;">
          <div style="color: var(--success); font-weight: bold;">今日已签到</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">明日再来领取奖励</div>
        </div>
      `;
    }
    
    content.innerHTML = html;
    popup.classList.add('active');
  },
  checkin() {
    if (this.checkinStatus.todayChecked) {
      ErrorHandler.showInfo('今日已签到');
      return;
    }
    
    this.checkinStatus.todayChecked = true;
    this.checkinStatus.streak++;
    this.checkinStatus.totalCheckins++;
    
    ErrorHandler.showSuccess('签到成功！获得奖励：' + this.rewards[this.checkinStatus.streak - 1].reward);
    this.openCheckinPopup();
  }
};

// 任务系统
const TaskSystem = {
  tasks: [
    {
      id: 1,
      title: '初入仙途',
      description: '完成新手引导',
      progress: 100,
      status: 'completed',
      reward: '灵石 x 1000, 聚气丹 x 5'
    },
    {
      id: 2,
      title: '修炼入门',
      description: '达到练气三层',
      progress: 75,
      status: 'in_progress',
      reward: '灵石 x 2000, 聚气丹 x 10'
    },
    {
      id: 3,
      title: '采集任务',
      description: '采集10株灵草',
      progress: 50,
      status: 'in_progress',
      reward: '灵石 x 1500, 聚气丹 x 8'
    },
    {
      id: 4,
      title: '击杀妖魔',
      description: '击杀5只妖魔',
      progress: 0,
      status: 'pending',
      reward: '灵石 x 3000, 聚气丹 x 15'
    }
  ],
  openTaskPopup() {
    const popup = document.getElementById('taskPopup');
    const content = document.getElementById('taskContent');
    
    let html = `
      <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    this.tasks.forEach(task => {
      html += `
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid ${task.status === 'completed' ? 'var(--success)' : task.status === 'in_progress' ? 'var(--gold-primary)' : 'rgba(230, 199, 73, 0.3)'};
          border-radius: 8px;
          padding: 15px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-weight: bold; color: ${task.status === 'completed' ? 'var(--success)' : 'var(--gold-primary)'};">${task.title}</div>
            <div style="font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; background: ${task.status === 'completed' ? 'rgba(76, 175, 80, 0.2)' : task.status === 'in_progress' ? 'rgba(230, 199, 73, 0.2)' : 'rgba(255, 255, 255, 0.1)'};">
              ${task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '未开始'}
            </div>
          </div>
          <div style="font-size: 0.9rem; color: var(--text-dim); margin-bottom: 10px;">${task.description}</div>
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
              <span>进度</span>
              <span>${task.progress}%</span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="
                height: 100%;
                background: ${task.status === 'completed' ? 'var(--success)' : 'var(--gold-primary)'};
                width: ${task.progress}%;
                border-radius: 3px;
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--gold-dim);">奖励: ${task.reward}</div>
          ${task.status === 'completed' ? 
            '<button class="popup-btn" onclick="TaskSystem.claimReward(' + task.id + ')" style="margin-top: 10px;">领取奖励</button>' : 
            task.status === 'in_progress' ? 
            '<button class="popup-btn" onclick="TaskSystem.continueTask(' + task.id + ')" style="margin-top: 10px;">继续任务</button>' : 
            '<button class="popup-btn" onclick="TaskSystem.startTask(' + task.id + ')" style="margin-top: 10px;">开始任务</button>'
          }
        </div>
      `;
    });
    
    html += `</div>`;
    content.innerHTML = html;
    popup.classList.add('active');
  },
  startTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'in_progress';
      task.progress = 0;
      ErrorHandler.showSuccess('任务已开始');
      this.openTaskPopup();
    }
  },
  continueTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.progress = Math.min(100, task.progress + 25);
      if (task.progress === 100) {
        task.status = 'completed';
        ErrorHandler.showSuccess('任务已完成！');
      } else {
        ErrorHandler.showInfo('任务进度更新');
      }
      this.openTaskPopup();
    }
  },
  claimReward(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      ErrorHandler.showSuccess('领取奖励成功：' + task.reward);
      this.openTaskPopup();
    }
  }
};

// 成就系统
const AchievementSystem = {
  achievements: [
    {
      id: 1,
      name: '初入仙途',
      description: '创建角色并完成新手引导',
      icon: '🎮',
      progress: 100,
      completed: true,
      reward: '灵石 x 1000, 聚气丹 x 5'
    },
    {
      id: 2,
      name: '修炼有成',
      description: '达到金丹期',
      icon: '⚡',
      progress: 60,
      completed: false,
      reward: '灵石 x 5000, 聚气丹 x 20'
    },
    {
      id: 3,
      name: '采集大师',
      description: '采集100株灵草',
      icon: '🌿',
      progress: 35,
      completed: false,
      reward: '灵石 x 3000, 聚气丹 x 15'
    },
    {
      id: 4,
      name: '除魔卫道',
      description: '击杀100只妖魔',
      icon: '⚔️',
      progress: 20,
      completed: false,
      reward: '灵石 x 8000, 聚气丹 x 30'
    },
    {
      id: 5,
      name: '社交达人',
      description: '添加10位好友',
      icon: '👥',
      progress: 40,
      completed: false,
      reward: '灵石 x 2000, 聚气丹 x 10'
    }
  ],
  openAchievementPopup() {
    const popup = document.getElementById('achievementPopup');
    const content = document.getElementById('achievementContent');
    
    const completedCount = this.achievements.filter(a => a.completed).length;
    const totalCount = this.achievements.length;
    
    let html = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 1.1rem; margin-bottom: 5px;">成就完成率</div>
        <div style="font-size: 2rem; font-weight: bold; color: var(--gold-primary);">${completedCount}/${totalCount}</div>
        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin: 10px 0;">
          <div style="
            height: 100%;
            background: var(--gold-primary);
            width: ${(completedCount / totalCount) * 100}%;
            border-radius: 3px;
          "></div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    this.achievements.forEach(achievement => {
      html += `
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid ${achievement.completed ? 'var(--success)' : 'rgba(230, 199, 73, 0.3)'};
          border-radius: 8px;
          padding: 15px;
          position: relative;
          overflow: hidden;
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <div style="font-size: 1.5rem; ${achievement.completed ? 'filter: drop-shadow(0 0 8px var(--success));' : ''}">${achievement.icon}</div>
            <div style="flex: 1;">
              <div style="font-weight: bold; color: ${achievement.completed ? 'var(--success)' : 'var(--gold-primary)'};">${achievement.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-dim);">${achievement.description}</div>
            </div>
            ${achievement.completed ? '<div style="font-size: 1.2rem; color: var(--success);">✓</div>' : ''}
          </div>
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
              <span>进度</span>
              <span>${achievement.progress}%</span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="
                height: 100%;
                background: ${achievement.completed ? 'var(--success)' : 'var(--gold-primary)'};
                width: ${achievement.progress}%;
                border-radius: 3px;
              "></div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--gold-dim);">奖励: ${achievement.reward}</div>
          ${achievement.completed ? 
            '<button class="popup-btn" onclick="AchievementSystem.claimReward(' + achievement.id + ')" style="margin-top: 10px;">领取奖励</button>' : 
            ''
          }
        </div>
      `;
    });
    
    html += `</div>`;
    content.innerHTML = html;
    popup.classList.add('active');
  },
  claimReward(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement) {
      ErrorHandler.showSuccess('领取奖励成功：' + achievement.reward);
      this.openAchievementPopup();
    }
  }
};

// 数据分析系统
const AnalyticsSystem = {
  data: {
    dailyActivity: {
      loginDays: 15,
      totalPlayTime: '12小时30分钟',
      averagePlayTime: '45分钟/天'
    },
    cultivation: {
      immortalLevel: '九天玄仙 3 阶',
      bodyLevel: '渡劫肉身 1 层',
      efficiency: '431%'
    },
    resources: {
      totalEarned: '2000万灵石',
      totalSpent: '800万灵石',
      netWorth: '1200万灵石'
    },
    tasks: {
      completed: 15,
      inProgress: 3,
      abandoned: 2
    }
  },
  openAnalyticsPopup() {
    const popup = document.getElementById('analyticsPopup');
    const content = document.getElementById('analyticsContent');
    
    let html = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(230, 199, 73, 0.3);
          border-radius: 8px;
          padding: 15px;
        ">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 10px;">📊 活跃度分析</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">登录天数</span><span style="font-weight: bold;">${this.data.dailyActivity.loginDays} 天</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">总游戏时间</span><span style="font-weight: bold;">${this.data.dailyActivity.totalPlayTime}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">平均游戏时间</span><span style="font-weight: bold;">${this.data.dailyActivity.averagePlayTime}</span></div>
          </div>
        </div>
        
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(230, 199, 73, 0.3);
          border-radius: 8px;
          padding: 15px;
        ">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 10px;">⚡ 修炼分析</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">仙道等级</span><span style="font-weight: bold;">${this.data.cultivation.immortalLevel}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">肉身等级</span><span style="font-weight: bold;">${this.data.cultivation.bodyLevel}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">修炼效率</span><span style="font-weight: bold; color: var(--success);">${this.data.cultivation.efficiency}</span></div>
          </div>
        </div>
        
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(230, 199, 73, 0.3);
          border-radius: 8px;
          padding: 15px;
        ">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 10px;">💰 资源分析</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">总获得</span><span style="font-weight: bold; color: var(--success);">${this.data.resources.totalEarned}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">总消耗</span><span style="font-weight: bold; color: var(--danger);">${this.data.resources.totalSpent}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">净资产</span><span style="font-weight: bold; color: var(--gold-primary);">${this.data.resources.netWorth}</span></div>
          </div>
        </div>
        
        <div style="
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(230, 199, 73, 0.3);
          border-radius: 8px;
          padding: 15px;
        ">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 10px;">📋 任务分析</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">已完成</span><span style="font-weight: bold; color: var(--success);">${this.data.tasks.completed} 个</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">进行中</span><span style="font-weight: bold; color: var(--gold-primary);">${this.data.tasks.inProgress} 个</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">已放弃</span><span style="font-weight: bold; color: var(--danger);">${this.data.tasks.abandoned} 个</span></div>
          </div>
        </div>
      </div>
      
      <div style="
        background: rgba(30, 35, 55, 0.6);
        border: 1px solid rgba(230, 199, 73, 0.3);
        border-radius: 8px;
        padding: 15px;
      ">
        <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 10px;">📈 近期趋势</div>
        <div style="height: 150px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: flex-end; justify-content: space-around; padding: 10px;">
          ${[65, 78, 45, 90, 85, 95, 80].map(value => `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
              <div style="
                width: 20px;
                background: linear-gradient(to top, var(--gold-primary), var(--gold-light));
                border-radius: 2px 2px 0 0;
                transition: height 0.5s ease;
                height: ${value}px;
              "></div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">${value}%</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align: center; font-size: 0.8rem; color: var(--text-dim); margin-top: 10px;">近7天活跃度趋势</div>
      </div>
    `;
    
    content.innerHTML = html;
    popup.classList.add('active');
  }
};

// 社交系统
const SocialSystem = {
  friends: [
    {
      id: 1,
      name: '剑断万古',
      level: 120,
      realm: '化神期',
      online: true,
      lastSeen: '刚刚'
    },
    {
      id: 2,
      name: '凌仙儿',
      level: 105,
      realm: '元婴期',
      online: true,
      lastSeen: '5分钟前'
    },
    {
      id: 3,
      name: '缥缈地窟道尊',
      level: 115,
      realm: '出窍期',
      online: false,
      lastSeen: '2小时前'
    },
    {
      id: 4,
      name: '独孤求败',
      level: 100,
      realm: '元婴期',
      online: false,
      lastSeen: '1天前'
    }
  ],
  openSocialPopup() {
    const popup = document.getElementById('socialPopup');
    const content = document.getElementById('socialContent');
    
    let html = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button class="popup-btn" onclick="SocialSystem.switchTab('friends')" id="tabFriends" style="flex: 1; background: linear-gradient(to bottom, #e6c749, #d4af37); color: #1a2530;">道友列表</button>
          <button class="popup-btn" onclick="SocialSystem.switchTab('add')" id="tabAdd" style="flex: 1;">添加道友</button>
          <button class="popup-btn" onclick="SocialSystem.switchTab('chat')" id="tabChat" style="flex: 1;">聊天</button>
        </div>
        
        <div id="socialTabContent">
          <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    this.friends.forEach(friend => {
      html += `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(230, 199, 73, 0.3);
          border-radius: 8px;
          padding: 12px;
          position: relative;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid ${friend.online ? 'var(--success)' : 'rgba(230, 199, 73, 0.3)'};
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
          ">👤</div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="font-weight: bold; color: ${friend.online ? 'var(--success)' : 'var(--text-dim)'};">${friend.name}</div>
              <div style="font-size: 0.7rem; background: ${friend.online ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
              color: ${friend.online ? 'var(--success)' : 'var(--text-dim)'};
              padding: 1px 6px; border-radius: 10px;">
                ${friend.online ? '在线' : '离线'}
              </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-dim);">Lv.${friend.level} ${friend.realm}</div>
            <div style="font-size: 0.7rem; color: var(--gold-dim);">${friend.lastSeen}</div>
          </div>
          <button class="popup-btn" onclick="SocialSystem.interactWithFriend(${friend.id})" style="padding: 6px 12px; font-size: 0.8rem;">互动</button>
        </div>
      `;
    });
    
    html += `
          </div>
        </div>
      </div>
    `;
    
    content.innerHTML = html;
    popup.classList.add('active');
  },
  switchTab(tab) {
    const tabContent = document.getElementById('socialTabContent');
    
    // 更新按钮样式
    document.getElementById('tabFriends').style.background = tab === 'friends' ? 'linear-gradient(to bottom, #e6c749, #d4af37)' : 'transparent';
    document.getElementById('tabFriends').style.color = tab === 'friends' ? '#1a2530' : 'var(--text-main)';
    document.getElementById('tabAdd').style.background = tab === 'add' ? 'linear-gradient(to bottom, #e6c749, #d4af37)' : 'transparent';
    document.getElementById('tabAdd').style.color = tab === 'add' ? '#1a2530' : 'var(--text-main)';
    document.getElementById('tabChat').style.background = tab === 'chat' ? 'linear-gradient(to bottom, #e6c749, #d4af37)' : 'transparent';
    document.getElementById('tabChat').style.color = tab === 'chat' ? '#1a2530' : 'var(--text-main)';
    
    if (tab === 'friends') {
      // 显示好友列表
      let html = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
      `;
      
      this.friends.forEach(friend => {
        html += `
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(30, 35, 55, 0.6);
            border: 1px solid rgba(230, 199, 73, 0.3);
            border-radius: 8px;
            padding: 12px;
            position: relative;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 2px solid ${friend.online ? 'var(--success)' : 'rgba(230, 199, 73, 0.3)'};
              background: rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.2rem;
            ">👤</div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="font-weight: bold; color: ${friend.online ? 'var(--success)' : 'var(--text-dim)'};">${friend.name}</div>
                <div style="font-size: 0.7rem; background: ${friend.online ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                color: ${friend.online ? 'var(--success)' : 'var(--text-dim)'};
                padding: 1px 6px; border-radius: 10px;">
                  ${friend.online ? '在线' : '离线'}
                </div>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-dim);">Lv.${friend.level} ${friend.realm}</div>
              <div style="font-size: 0.7rem; color: var(--gold-dim);">${friend.lastSeen}</div>
            </div>
            <button class="popup-btn" onclick="SocialSystem.interactWithFriend(${friend.id})" style="padding: 6px 12px; font-size: 0.8rem;">互动</button>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
      tabContent.innerHTML = html;
    } else if (tab === 'add') {
      // 显示添加好友界面
      tabContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; gap: 10px;">
            <input type="text" placeholder="输入道友名称" style="
              flex: 1;
              padding: 10px;
              background: rgba(0,0,0,0.3);
              border: 1px solid rgba(230, 199, 73, 0.3);
              border-radius: 6px;
              color: var(--text-main);
              font-size: 0.9rem;
            ">
            <button class="popup-btn" style="padding: 0 20px;">搜索</button>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
            <div style="color: var(--text-dim);">搜索道友并发送好友请求</div>
          </div>
        </div>
      `;
    } else if (tab === 'chat') {
      // 显示聊天界面
      tabContent.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 300px;">
          <div style="flex: 1; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 15px; overflow-y: auto; margin-bottom: 10px;">
            <div style="display: flex; justify-content: flex-start; margin-bottom: 10px;">
              <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 1px solid rgba(230, 199, 73, 0.3);
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                margin-right: 8px;
              ">👤</div>
              <div style="background: rgba(30, 35, 55, 0.8); border-radius: 12px 12px 12px 4px; padding: 8px 12px; max-width: 70%;">
                <div style="font-size: 0.7rem; color: var(--gold-dim); margin-bottom: 2px;">剑断万古</div>
                <div style="font-size: 0.8rem; color: var(--text-main);">道友，一起组队刷图吗？</div>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
              <div style="background: rgba(230, 199, 73, 0.2); border-radius: 12px 12px 4px 12px; padding: 8px 12px; max-width: 70%;">
                <div style="font-size: 0.8rem; color: var(--text-main);">好的，我马上来</div>
              </div>
              <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 1px solid var(--gold-primary);
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                margin-left: 8px;
              ">👤</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" placeholder="输入消息..." style="
              flex: 1;
              padding: 10px;
              background: rgba(0,0,0,0.3);
              border: 1px solid rgba(230, 199, 73, 0.3);
              border-radius: 6px;
              color: var(--text-main);
              font-size: 0.9rem;
            ">
            <button class="popup-btn" style="padding: 0 20px;">发送</button>
          </div>
        </div>
      `;
    }
  },
  interactWithFriend(id) {
    const friend = this.friends.find(f => f.id === id);
    if (friend) {
      showPopup('与道友互动', `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 2rem; margin-bottom: 10px;">👥</div>
          <div style="font-weight: bold; color: var(--gold-primary); margin-bottom: 5px;">${friend.name}</div>
          <div style="color: var(--text-dim); margin-bottom: 20px;">Lv.${friend.level} ${friend.realm}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="popup-btn" onclick="SocialSystem.chatWithFriend(${id})">聊天</button>
          <button class="popup-btn" onclick="SocialSystem.viewProfile(${id})">查看资料</button>
          <button class="popup-btn" onclick="SocialSystem.inviteToTeam(${id})">组队邀请</button>
          <button class="popup-btn" onclick="SocialSystem.sendGift(${id})">赠送礼物</button>
        </div>
      `);
    }
  },
  chatWithFriend(id) {
    const friend = this.friends.find(f => f.id === id);
    if (friend) {
      ErrorHandler.showInfo(`开始与 ${friend.name} 聊天`);
      this.openSocialPopup();
      setTimeout(() => {
        this.switchTab('chat');
      }, 100);
    }
  },
  viewProfile(id) {
    const friend = this.friends.find(f => f.id === id);
    if (friend) {
      showPopup(`${friend.name} 的资料`, `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid var(--gold-primary);
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            margin: 0 auto 10px;
          ">👤</div>
          <div style="font-weight: bold; color: var(--gold-primary); margin-bottom: 5px;">${friend.name}</div>
          <div style="color: var(--text-dim); margin-bottom: 10px;">Lv.${friend.level} ${friend.realm}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">在线状态</span><span style="font-weight: bold; color: ${friend.online ? 'var(--success)' : 'var(--text-dim)'}">${friend.online ? '在线' : '离线'}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">上次在线</span><span style="font-weight: bold;">${friend.lastSeen}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">道友等级</span><span style="font-weight: bold; color: var(--gold-primary);">${friend.level}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">修炼境界</span><span style="font-weight: bold;">${friend.realm}</span></div>
        </div>
      `);
    }
  },
  inviteToTeam(id) {
    const friend = this.friends.find(f => f.id === id);
    if (friend) {
      ErrorHandler.showInfo(`发送组队邀请给 ${friend.name}`);
    }
  },
  sendGift(id) {
    const friend = this.friends.find(f => f.id === id);
    if (friend) {
      showPopup('赠送礼物', `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-weight: bold; color: var(--gold-primary); margin-bottom: 5px;">选择礼物</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
          <div style="
            background: rgba(30, 35, 55, 0.6);
            border: 1px solid rgba(230, 199, 73, 0.3);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
          ">
            <div style="font-size: 1.5rem; margin-bottom: 5px;">💊</div>
            <div style="font-size: 0.8rem;">聚气丹</div>
          </div>
          <div style="
            background: rgba(30, 35, 55, 0.6);
            border: 1px solid rgba(230, 199, 73, 0.3);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
          ">
            <div style="font-size: 1.5rem; margin-bottom: 5px;">💰</div>
            <div style="font-size: 0.8rem;">灵石</div>
          </div>
          <div style="
            background: rgba(30, 35, 55, 0.6);
            border: 1px solid rgba(230, 199, 73, 0.3);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
          ">
            <div style="font-size: 1.5rem; margin-bottom: 5px;">🎁</div>
            <div style="font-size: 0.8rem;">礼盒</div>
          </div>
        </div>
        <button class="popup-btn" onclick="ErrorHandler.showSuccess('礼物已发送！')">赠送</button>
      `);
    }
  }
};

// 弹窗控制函数
function openCheckinPopup() {
  CheckinSystem.openCheckinPopup();
}

function closeCheckinPopup(e) {
  if (!e || e.target === document.getElementById('checkinPopup')) {
    document.getElementById('checkinPopup').classList.remove('active');
  }
}

function openTaskPopup() {
  TaskSystem.openTaskPopup();
}

function closeTaskPopup(e) {
  if (!e || e.target === document.getElementById('taskPopup')) {
    document.getElementById('taskPopup').classList.remove('active');
  }
}

function openAchievementPopup() {
  AchievementSystem.openAchievementPopup();
}

function closeAchievementPopup(e) {
  if (!e || e.target === document.getElementById('achievementPopup')) {
    document.getElementById('achievementPopup').classList.remove('active');
  }
}

function openAnalyticsPopup() {
  AnalyticsSystem.openAnalyticsPopup();
}

function closeAnalyticsPopup(e) {
  if (!e || e.target === document.getElementById('analyticsPopup')) {
    document.getElementById('analyticsPopup').classList.remove('active');
  }
}

function openSocialPopup() {
  SocialSystem.openSocialPopup();
}

function closeSocialPopup(e) {
  if (!e || e.target === document.getElementById('socialPopup')) {
    document.getElementById('socialPopup').classList.remove('active');
  }
}

// 初始化游戏功能
window.addEventListener('DOMContentLoaded', function() {
  // 检查并显示任务角标
  const taskBadge = document.getElementById('taskBadge');
  if (taskBadge) {
    const pendingTasks = TaskSystem.tasks.filter(t => t.status === 'completed' || t.status === 'in_progress').length;
    if (pendingTasks > 0) {
      taskBadge.textContent = pendingTasks;
      taskBadge.style.display = 'block';
    }
  }
  
  // 检查并显示成就角标
  const achievementBadge = document.getElementById('achievementBadge');
  if (achievementBadge) {
    const completedAchievements = AchievementSystem.achievements.filter(a => a.completed).length;
    if (completedAchievements > 0) {
      achievementBadge.textContent = completedAchievements;
      achievementBadge.style.display = 'block';
    }
  }
  
  // 检查并显示签到角标
  const checkinBadge = document.getElementById('checkinBadge');
  if (checkinBadge && !CheckinSystem.checkinStatus.todayChecked) {
    checkinBadge.style.display = 'block';
  }
});