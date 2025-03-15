<template>
  <div id="app">
    <div class="TimeInterval">
      <!-- 標題 -->
      <div class="header">
        <h1 class="page-title">等候時間</h1>
        <div class="current-setting">
          <span class="label">當前設置：</span>
          <span class="value">{{ currentInterval }}分鐘</span>
        </div>
      </div>

      <!-- 時段按鈕群組 -->
      <div class="interval-buttons">
        <button v-for="m in [0, 15, 30, 45, 60]" :key="m" class="time-option"
          :class="{ selected: currentInterval === m }" :style="getButtonStyle(m)" @click="selectInterval(m)"
          :disabled="isSubmitting">
          <div class="btn-content">
            <span>{{ m }}分鐘</span>
            <div v-if="isSubmitting && selectedInterval === m" class="loading-spinner"></div>
          </div>
        </button>
      </div>

      <!-- 營業狀態按鈕 -->
      <button class="time-option" :class="{ 'selected': isOpen, 'rest-mode': !isOpen }"
      @click="toggleOpenStatus"
      :disabled="isSubmitting">
        <div class="btn-content">
          <span>{{ isOpen ? '營業中' : '休息中' }}</span>
          <div v-if="isSubmitting" class="loading-spinner"></div>
        </div>
      </button>
    </div>
    <div class="global-notification" :class="{ 'show': showNotification }" :data-type="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedInterval: 0,
      currentInterval: 0,
      showNotification: false,
      notificationMessage: '',
      isSubmitting: false,
      isOpen: true
    }
  },
  mounted() {
    this.fetchCurrentInterval()
    this.fetchCurrentOpen()
    this.timer = setInterval(this.syncInterval, 3 * 60 * 1000) // 每3分鐘同步
  },
  methods: {
    async fetchCurrentInterval() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/api/setting_time`);
        const data = await res.json();
        this.currentInterval = data.interval;
      } catch (error) {
        console.error('獲取時間失敗:', error);
        this.showGlobalNotification('⚠️ 無法取得等候時間', 3000, 'warning');
      }
    },
    async updateInterval() {
      this.isSubmitting = true;
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/api/setting_time`, { interval: this.selectedInterval });
        await this.fetchCurrentInterval();

        this.showGlobalNotification('✅ 已設定等候時間', 5000, 'success');
      } catch (error) {
        console.error('設定失敗:', error);
        const msg = error.response?.data?.error || '時間設定失敗，請稍後再試';
        this.showGlobalNotification(`⚠️ ${msg}`, 5000, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    async fetchCurrentOpen() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/api/setting_open`);
        const data = await res.json();
        this.isOpen = data.opened;
      } catch (error) {
        console.error('獲取營業錯誤:', error);
        this.showGlobalNotification('⚠️ 無法取得營業狀態', 3000, 'warning');
      }
    },
    async toggleOpenStatus() {
      this.isSubmitting = true;
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/api/setting_open`, { opened: !this.isOpen });
        await this.fetchCurrentOpen();
        
        const message = this.isOpen ? '✅ 已開啟營業' : '🚫 已停止營業';
        this.showGlobalNotification(message, 5000, 'success');
      } catch (error) {
        const msg = error.response?.data?.error || '營業更新失敗';
        this.showGlobalNotification(`⚠️ ${msg}`, 5000, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    getButtonStyle(minutes) {
      const palette = {
        0: { base: '#F7F7F7', active: '#607D8B' },
        15: { base: '#C8E6C9', active: '#4CAF50' }, // 柔薄荷
        30: { base: '#FFF9C4', active: '#FFD600' }, // 浅琥珀
        45: { base: '#FFE0B2', active: '#FF9800' }, // 晨橙色
        60: { base: '#FFCDD2', active: '#F44336' }  // 粉雾红
      }[minutes]

      return {
        '--base-color': palette.base,
        '--active-color': palette.active
      }
    },
    selectInterval(minutes) {
      if (this.isSubmitting) return;
      this.selectedInterval = minutes;
      this.updateInterval();
    },
    async syncInterval() {
      await this.updateInterval();
    },
    showGlobalNotification(message, duration = 3000, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, duration);
    }
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
#app {
  max-width: 100%;
  margin: 0 10px;
  background: white;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  padding: 0.5rem 0;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 60px;
  height: 3px;
  background: #4CAF50;
  transform: translateX(-50%);
  border-radius: 2px;
}

.current-setting {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.current-setting .label {
  font-weight: 400;
  color: #666;
}

.current-setting .value {
  font-weight: 500;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 8px;
}

.time-option {
  width: 100%;
  padding: 1.25rem;
  margin: 0.5rem 0;
  border: none;
  border-radius: 12px;
  background-color: var(--base-color);
  color: rgba(0, 0, 0, 0.8);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.time-option::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 14px;
  transition: border-color 0.3s ease;
}

.time-option.selected::before {
  border-color: var(--active-color);
}

.time-option:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.time-option:disabled {
  opacity: 0.7;
  filter: grayscale(20%);
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

/* 營業中按鈕 */
.time-option.selected {
  --base-color: #C8E6C9;      /* 營業中底色 (柔薄荷) */
  --active-color: #4CAF50;    /* 邊框顏色 (品牌綠) */
}

.time-option.selected .btn-content span {
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 休息中按鈕 */
.time-option.rest-mode {
  --base-color: #F0F0F0;
  --active-color: #666;
}

.time-option.rest-mode .btn-content span {
  color: #666;
  font-weight: 600;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 調整按鈕間距 */
.interval-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.global-notification {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    transition: transform 0.3s ease;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    color: white;
    font-weight: bold;
    transform: translateY(-100%);
    will-change: transform;
}

.global-notification.show {
    transform: translateY(0);
}

/* 按類型切換背景色 */
.global-notification[data-type="error"] {
    background: #e74c3c;
}

.global-notification[data-type="warning"] {
    background: #f39c12;
}

.global-notification[data-type="success"] {
    background: #2ecc71;
}

@media (max-width: 480px) {
    .global-notification {
        padding: 16px;
        font-size: 1.1rem;
    }
}
</style>