<template>
  <div class="time-settings">
    <!-- 標題 -->
    <div class="header">
      <h1 class="page-title">等候時間</h1>
      <div class="current-setting">
        <span class="label">當前設置：</span>
        <span class="value">{{ currentInterval }}分鐘</span>
      </div>
    </div>

    <!-- 按鈕群組 -->
    <div class="interval-buttons">
      <button v-for="m in [0, 15, 30, 45, 60]" :key="m" class="time-option" :class="{ selected: currentInterval === m }"
        :style="getButtonStyle(m)" @click="selectInterval(m)" :disabled="isSubmitting">
        <div class="btn-content">
          <span>{{ m }}分鐘</span>
          <div v-if="isSubmitting && currentInterval === m" class="loading-spinner"></div>
        </div>
      </button>
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
      isSubmitting: false,
    }
  },
  mounted() {
    this.fetchCurrentInterval()
    this.timer = setInterval(this.syncInterval, 5 * 60 * 1000) // 每5分鐘同步
  },
  methods: {
    async fetchCurrentInterval() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/api/setting_time`);
        const data = await res.json();
        this.currentInterval = data.interval;
      } catch (error) {
        console.error('獲取時間失敗:', error);
      }
    },
    async updateInterval() {
      this.isSubmitting = true;
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/api/setting_time`, { interval: this.selectedInterval })
        await this.fetchCurrentInterval();
      } catch (error) {
        console.error('設定失敗:', error);
      } finally {
        this.isSubmitting = false;
      }
    },
    getButtonStyle(minutes) {
      const palette = {
        0: { base: '#CFD8DC', active: '#607D8B' },  // 雾灰蓝
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
      await this.updateInterval()
      await this.fetchCurrentInterval()
    }
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
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

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>