<template>
    <div id="app">
        <h1 class="header">三重埔鹽酥雞</h1>

        <!-- 延遲提示 -->
        <div v-if="isServerDelayed" class="delay-notice">
            <div class="loading-icon"></div>
            <p>菜單組建中，請稍候約 30 秒 …</p>
        </div>

        <!-- 菜單分類區塊 -->
        <template v-if="isMenuLoaded">
        <div v-for="category in categories" :key="category.name" class="menu-category">
            <h2 class="category-title">{{ category.name }}</h2>
            <div class="menu-items">
                <div v-for="(item, index) in category.items" :key="index" class="menu-item">
                    <!-- 有規格的商品 -->
                    <div v-if="item.sizes" class="item-with-size">
                        <div class="item-header">
                            <span class="item-name">{{ item.name }}</span>
                            <select v-model="item.selectedSize" class="size-select" @change="updateTotal">
                                <option v-for="(size, sizeIndex) in item.sizes" :key="sizeIndex" :value="sizeIndex">
                                    {{ size.label }} ${{ size.price }}
                                </option>
                            </select>
                        </div>
                        <div class="quantity-control">
                            <button class="qty-btn" @click="decreaseQuantity(category.name, index)">-</button>
                            <span class="quantity" :class="{ 'highlight': item.quantity > 0 }">{{ item.quantity }}</span>
                            <button class="qty-btn" @click="increaseQuantity(category.name, index)">+</button>
                        </div>
                    </div>

                    <!-- 單一價格商品 -->
                    <div v-else class="simple-item">
                        <span class="item-name">{{ item.name }} ${{ item.price }}</span>
                        <div class="quantity-control">
                            <button class="qty-btn" @click="decreaseQuantity(category.name, index)">-</button>
                            <span class="quantity" :class="{ 'highlight': item.quantity > 0 }">{{ item.quantity }}</span>
                            <button class="qty-btn" @click="increaseQuantity(category.name, index)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </template>

        <!-- 調味選擇區塊 -->
        <div v-if="isMenuLoaded" class="seasoning-section">
            <h2 class="seasoning-title">調味選擇</h2>
            <div class="seasoning-grid">
                <div class="seasoning-group">
                    <label class="seasoning-label">辣度：</label>
                    <select v-model="seasoning.spiciness" class="seasoning-select">
                        <option v-for="opt in spicinessOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>

                <div class="seasoning-group">
                    <label class="seasoning-label">灑粉：</label>
                    <select v-model="seasoning.powder" class="seasoning-select">
                        <option v-for="opt in powderOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>

                <div class="seasoning-group toppings-group">
                    <label class="seasoning-label">配料：</label>
                    <div class="toppings-grid">
                        <label v-for="opt in toppingOptions" :key="opt" class="topping-option">
                            <input type="checkbox" v-model="seasoning.toppings" :value="opt">
                            {{ opt }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="customer-info-section">
            <h2 class="customer-info-title">訂購資訊</h2>

            <div class="form-card">
                <div class="input-group">
                    <label class="input-label required">您的稱呼</label>
                    <input type="text" v-model="customer.name" class="modern-input" placeholder="例：安啾" maxlength="30"
                        required @blur="validateName">
                    <div class="input-error" v-if="nameError">{{ nameError }}</div>
                </div>

                <div class="input-group">
                    <label class="input-label">聯絡電話</label>
                    <input type="tel" v-model="customer.phone" class="modern-input" placeholder="（選填）" pattern="[0-9]*"
                        inputmode="numeric" maxlength="10">
                </div>

                <div class="input-group time-picker-wrapper">
                    <label class="input-label">取餐時間</label>
                    <div class="time-select-container">
                        <select v-model="pickupTime" @change="validatePickupTime"
                            :class="['custom-time-select', { 'invalid': !isValidTime }]">
                            <option v-for="time in availableTimes" :key="time.value" :value="time.value"
                                :disabled="time.disabled">
                                {{ time.display }}
                            </option>
                        </select>
                        <span class="time-hint">{{ timeHintMessage }}</span>
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">備註</label>
                    <textarea v-model="customer.notes" class="modern-textarea" maxlength="200" placeholder="特殊需求請在此備註"
                        @input="checkNotesLength"></textarea>
                    <div class="char-counter" :data-count="customer.notes.length">{{ customer.notes.length }}/200</div>
                </div>
            </div>
        </div>

        <div class="global-notification" :class="{ 'show': showNotification }" :data-type="notificationType">
            {{ notificationMessage }}
        </div>

        <!-- 結帳區塊 -->
        <div class="checkout-section">
            <div class="total-display">
                <span class="total-label">總金額：</span>
                <span class="total-amount">${{ total }}</span>
            </div>
            <button class="submit-btn" @click="submitOrder" :disabled="isSubmitting">
                <div class="btn-content">
                    <span v-if="!isSubmitting">送出訂單</span>
                    <div v-else class="loading-spinner"></div>
                </div>
            </button>
        </div>

        <transition name="slide-up">
        <div v-if="showShopClosed" class="shop-closed-notice" @click.self="closeShopNotice">
            <div class="notice-content">
            <button class="close-btn" @click="closeShopNotice">×</button>
            <h2 class="notice-title">我們打烊了！</h2>
            <img src="/images/close-image.jpg" class="notice-img" alt="關店圖片">
            <p class="notice-close-day">每週一．二為固定公休時間</p>            
            </div>
        </div>
        </transition>
    </div>
    <router-view></router-view>
</template>

<script>
import axios from 'axios';

export default {
    name: 'App',
    data() {
        return {
            isOpening: true,
            showShopClosed: false,
            checkOpenTimer: null,
            categories: [],
            seasoning: {
                spiciness: '不辣',
                powder: '未選',
                toppings: []
            },
            isMenuLoaded: true,
            isServerDelayed: true,
            customer: {
                name: '',
                phone: '',
                notes: ''
            },
            nameError: '',
            interval: 0,
            pickupTime: '',
            availableTimes: [
                { value: '', display: '不限時間', disabled: false }
            ],
            isValidTime: true,
            timeHintMessage: '目前要等候 0 分鐘',
            isSubmitting: false,
            showNotification: false,
            notificationMessage: ''
        }
    },
    props: {
        show: { type: Boolean, default: false }
    },
    computed: {
        total() {
            return this.categories.reduce((sum, category) => {
                return sum + category.items.reduce((catSum, item) => {
                    if (item.sizes) {
                        return catSum + (item.sizes[item.selectedSize].price * item.quantity)
                    }
                    return catSum + (item.price * item.quantity)
                }, 0)
            }, 0)
        },
    },
    async created() {
        await this.fetchMenu()
        this.generateTimeSlots()
        this.startOpenTimer()
    },
    beforeUnmount() {
        clearInterval(this.checkOpenTimer)
    },
    methods: {
        async fetchMenu() {
            this.isMenuLoaded = false
            try {

                const response = await axios.get(`${process.env.VUE_APP_API_URL}/api/kuasasiaola`)
                
                this.isOpening = response.data.opened
                this.showShopClosed = !this.isOpening

                this.categories = response.data.categories
                this.spicinessOptions = response.data.seasoning.spicinessOptions
                this.powderOptions = response.data.seasoning.powderOptions
                this.toppingOptions = response.data.seasoning.toppingOptions
                this.isMenuLoaded = true
                this.isServerDelayed = false

                this.interval = response.data.interval
                this.updateIntervalHintMessage(this.interval)

            } catch (error) {
                this.isServerDelayed = true

                console.error('菜單載入失敗:', error)
                this.showGlobalNotification('⚠️ 菜單載入失敗，請稍後再試', 3000, 'error')
            }
        },
        increaseQuantity(categoryName, itemIndex) {
            const category = this.categories.find(c => c.name === categoryName)
            const item = category.items[itemIndex]
            if (item.quantity < 50) item.quantity++
        },
        decreaseQuantity(categoryName, itemIndex) {
            const category = this.categories.find(c => c.name === categoryName)
            const item = category.items[itemIndex]
            if (item.quantity > 0) item.quantity--
        },
        async submitOrder() {
            if (!this.customer.name.trim()) {
                this.validateName();
                return;
            }

            if (this.total === 0) {
                this.showGlobalNotification('⚠️ 請選擇至少一項商品', 3000, 'info');
                return;
            }

            this.isSubmitting = true;
            try {

                const orderData = {
                    customer: {
                        name: this.customer.name.trim().slice(0, 30),
                        ...(this.customer.phone && { phone: this.customer.phone }),
                        ...(this.pickupTime && { pickupTime: this.pickupTime })
                    },
                    items: this.categories.flatMap(category =>
                        category.items
                            .filter(item => item.quantity > 0)
                            .map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.sizes ? item.sizes[item.selectedSize].price : item.price,
                                ...(item.sizes && { size: item.sizes[item.selectedSize].label })
                            }))
                    ),
                    seasoning: {
                        spiciness: this.seasoning.spiciness,
                        ...(this.seasoning.powder !== '未選' && { powder: this.seasoning.powder }),
                        ...(this.seasoning.toppings.length > 0 && { toppings: this.seasoning.toppings }),
                        ...(this.customer.notes && { notes: this.customer.notes })
                    },
                    total: this.total
                };

                let timeoutId;
                let isResolved = false;

                const timeoutPromise = new Promise((resolve) => {
                    timeoutId = setTimeout(() => {
                        if (!isResolved) {
                            resolve({ status: 'timeout' });
                        }
                    }, 10000);
                })

                const postPromise = axios.post(`${process.env.VUE_APP_API_URL}/api/send-to-line`,
                    orderData
                ).then(response => {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    return response;
                })

                const response = await Promise.race([postPromise, timeoutPromise]);

                if (response.status === 'timeout') {
                    this.showGlobalNotification('‼️ 處理過久，請聯絡店家確認', 8000, 'warning');
                }

                if (response.status == 200) {
                    this.showGlobalNotification('✅ 訂單已送出！請至店面結帳', 5000, 'success');
                    this.customer.name = '';
                }

            } catch (error) {
                const message = error.response?.data?.error || '訂單發送失敗，請稍後再試';
                this.showGlobalNotification(`⚠️ ${message}`, 5000, 'error');
            } finally {
                this.isSubmitting = false;
            }
        },
        validateName() {
            if (!this.customer.name.trim()) {
                this.showGlobalNotification('⚠️ 請輸入您的稱呼', 3000, 'info');
                this.nameError = '請輸入您的稱呼';
            } else {
                this.nameError = '';
            }
        },
        async fetchIsOpen() {
            try {
                const res = await fetch(`${process.env.VUE_APP_API_URL}/api/setting_open`);
                const data = await res.json();

                this.isOpening = data.opened;
                this.showShopClosed = !this.isOpening;
            } catch (error) {
                console.error('更新營業失敗:', error);
            }
        },
        // 震動回饋
        triggerHapticFeedback() {
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        },
        showGlobalNotification(message, duration = 3000, type = 'info') {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, duration);
            if (['error', 'warning'].includes(type)) {
                this.triggerHapticFeedback();
            }
        },
        generateTimeSlots() {
            if (this.isOpening === false) {
                return
            }

            const now = new Date();
            const slots = [{ value: '', display: '不限時間', disabled: false }]; // 預設選項

            let baseTime = new Date(now.getTime() + this.interval * 60000);
            if (this.interval === 0) {
                baseTime = new Date(now.getTime() + 10 * 60000);
            }

            // 5分鐘間隔
            const baseMinutes = baseTime.getMinutes();
            const alignedMinutes = Math.ceil(baseMinutes / 5) * 5;
            baseTime.setMinutes(alignedMinutes);
            baseTime.setSeconds(0, 0);

            // 營業期間
            const startTime = new Date(baseTime);
            startTime.setHours(18, 30, 0, 0);
            const endTime = new Date(baseTime);
            endTime.setHours(25, 0, 0, 0);

            let time = new Date(baseTime);
            // 3小時內
            for (let i = 0; i < 36; i++) {
                if (time >= endTime) break;

                const { period, displayHours, minutes } = this.format(time);

                slots.push({
                    value: time.toTimeString().slice(0, 5),
                    display: `${period} ${displayHours}:${minutes}`,
                    disabled: time < now || time >= endTime || this.isNonBusinessHours(time)
                });

                time = new Date(time.getTime() + 5 * 60000);
            }

            this.availableTimes = slots;
            this.pickupTime = slots.find(t => !t.disabled)?.value || '';
        },
        format(time) {
            const hours = time.getHours();
            return {
                period: hours >= 12 ? '下午' : '上午',
                displayHours: hours % 12 || 12,
                minutes: String(time.getMinutes()).padStart(2, '0')
            };
        },
        isNonBusinessHours(time) {
            const hour = time.getHours();
            const isAfterClose = hour >= 1 && hour < 18;
            const isBeforeOpen = hour === 18 && time.getMinutes() < 40;
            return isAfterClose || isBeforeOpen;
        },
        updateIntervalHintMessage(interval) {
            if (this.isOpening === false) {
                this.timeHintMessage = '目前沒有營業'
                return
            }
            this.timeHintMessage = interval === 0
                ? '目前可為您現做'
                : `目前要等候 ${interval} 分鐘`;
        },
        checkNotesLength() {
            if (this.customer.notes.length >= 200) {
                this.customer.notes = this.customer.notes.slice(0, 200)
            }
        },
        closeShopNotice() {
            this.showShopClosed = false
        },
        startOpenTimer() {
            this.checkOpenTimer = setInterval(this.fetchIsOpen, 60 * 1000);
        }
    }
}
</script>

<style scoped>
/* 基礎樣式 */
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 10px;
    background-color: #f5f5f5;
}

#app {
    max-width: 100%;
    margin: 0 10px;
    background: white;
    padding: 15px;
    border-radius: 15px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

/* 標題 */
.header {
    text-align: center;
    color: #FF6B6B;
    margin-bottom: 30px;
    font-size: 2.2em;
}

/* 全局通知 */
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

.global-notification[data-type="info"] {
    background: #3498db;
}

/* 關店通告樣式 */
.shop-closed-notice {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.notice-content {
  background: #fff;
  width: 80%;
  max-width: 415px;
  padding: 1.0rem 1.5rem;
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
  border-radius: 32px 32px 0 0;
  text-align: center;
  position: relative;
  animation: slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 2rem;
  background: none;
  border: none;
  color: #666;
  line-height: 1;
  padding: 12px;
  cursor: pointer;
  touch-action: manipulation; /* 避免點擊延遲 */
}

.close-btn:hover {
  color: #FF6B6B;
  transform: scale(1.1);
}

.notice-title {
  color: #FF6B6B;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.notice-close-day {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.notice-img {
  /*font-size: 2.6rem;
  margin: 1rem 0;*/
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  padding: 4px;                /* 邊框內間距 */
  background: white;         /* 底色 */
  box-shadow: 0 4px 16px rgba(0,0,0,0.2); /* 陰影強化層次 */
}

/* 動畫與既有樣式兼容 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.customer-info-section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    background: #fff;
}

.customer-info-title {
    color: #2980b9;
    border-bottom: 2px solid #2980b9;
    font-size: 1.4rem;
    padding-left: 16px;
    margin: 0 0 20px 0;
    position: relative;
}

/* 动态效果（可选） */
.customer-info-title::after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0%;
    height: 3px;
    background: #2980b9;
    transition: width 0.3s ease;
}

.customer-info-title:hover::after {
    width: 100%;
}

.customer-info-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 70%;
    background: #2980b9;
    border-radius: 10px;
}

.form-card {
    width: 100%;
    max-width: 600px;
    background: #ffffff;
    padding: 0;
    margin: 0 auto;
}

.input-group {
    margin-bottom: 1.5rem;
    position: relative;
}

.input-group:last-child {
    margin-bottom: 0;
    /* 最後一個元素不需要底部間距 */
}

.input-label {
    display: block;
    font-size: 0.95rem;
    color: #34495e;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.input-label.required::after {
    content: "*";
    color: #e74c3c;
    margin-left: 4px;
    vertical-align: middle;
}

.input-error {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 4px;
    animation: shake 0.5s ease;
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(5px);
    }

    75% {
        transform: translateX(-5px);
    }
}

.modern-textarea {
    margin-top: 0.5rem;
    min-height: 100px;
    resize: none !important;
}

.modern-input,
.custom-time-select,
.modern-textarea {
    width: 100% !important;
    min-width: 100% !important;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    background: #f8f9fa;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.modern-input:focus,
.modern-textarea:focus {
    background: #fff;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.input-group:focus-within::after {
    width: 100%;
}

.time-select-container {
    position: relative;
    width: 100%;
}

.custom-time-select {
    width: 100%;
    max-width: none;
    padding: 12px;
    padding-right: 35px;
    border: 1px solid #ddd;
    border-radius: 8px;
    appearance: none;
    background: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23757575' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 12px center/16px;
    font-size: 1rem;
    color: #2c3e50;
    transition: border-color 0.3s ease;
}

.custom-time-select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.custom-time-select.invalid {
    border-color: #e74c3c;
    background-color: #fff5f5;
}

.time-hint {
    display: block;
    margin-top: 8px;
    color: #7f8c8d;
    font-size: 0.85rem;
}

@media (max-width: 480px) {
    .form-card {
        padding: 0px;
    }

    .input-group {
        margin-bottom: 1.2rem;
    }

    .section-title {
        font-size: 1.4rem;
    }

    .quantity {
        font-size: 1.3em;
        min-width: 40px;
        padding: 6px 10px;
    }

    .modern-input,
    .custom-time-select {
        font-size: 16px !important;
        padding: 12px 10px !important;
    }

    .modern-input,
    .modern-textarea {
        width: 100% !important;
        min-width: 100% !important;
    }

    .global-notification {
        padding: 16px;
        font-size: 1.1rem;
    }

    .notice-content {
        border-radius: 15px 15px 0 0;
        padding: 1.5rem 1rem;
    }

    .notice-title {
        font-size: 1.3rem;
    }

    .notice-close-day {
        font-size: 0.9rem;
    }

    .input-error {
        font-size: 0.9rem;
    }
}

.char-counter {
    font-size: 0.8em;
    color: #666;
    text-align: right;
    transition: color 0.3s ease;
}

/* 接近字数限制时改变颜色 */
.char-counter[data-count="190"] {
    color: #f39c12;
}

.char-counter[data-count="200"] {
    color: #e74c3c;
}

small {
    color: #666;
    margin-left: 10px;
}

.time-label {
    font-weight: 500;
    color: #2c3e50;
}

/* 菜單分類 */
.menu-category {
    margin-bottom: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    background: #fff;
}

.category-title {
    border-bottom: 2px solid;
    padding-bottom: 10px;
    margin-bottom: 15px;
    font-size: 1.4em;
}

.menu-category:nth-child(1) .category-title {
    color: #FFA500;
    border-bottom-color: #FFA500;
}
.menu-category:nth-child(2) .category-title {
    color: #FF6347;
    border-bottom-color: #FF6347;
}
.menu-category:nth-child(3) .category-title {
    color: #54ad79;
    border-bottom-color: #54ad79;
}
.menu-category:nth-child(4) .category-title {
    color: #DA70D6;
    border-bottom-color: #DA70D6;
}
.menu-category:nth-child(5) .category-title {
    color: #FF69B4;
    border-bottom-color: #FF69B4;
}
.menu-category:nth-child(6) .category-title {
    color: #A2D2DF;
    border-bottom-color: #A2D2DF;
}

/* 商品項目 */
.menu-items {
    display: grid;
    gap: 15px;
}

.menu-items,
.input-group {
    width: 100%;
    max-width: 100%;
}

.item-with-size,
.simple-item {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    transition: background 0.2s;
}

.item-with-size:hover,
.simple-item:hover {
    background: #f0f0f0;
}

.item-name {
    font-size: 16px;
    min-width: 100px;
    color: #34495e;
    flex: 1;
}

.size-select {
    margin-left: 8px;
    padding: 4px 8px;
    max-width: 100px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: white;
    font-size: 14px;
}

/* 數量控制 */
.quantity-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 20px;
}

.qty-btn {
    padding: 6px 12px;
    min-width: 40px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1em;
    transition: background 0.2s;
}

.qty-btn:hover {
    background: #2980b9;
}

.qty-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.quantity {
    min-width: 32px;
    text-align: center;
    font-weight: bold;
    color: #2c3e50;
    transition: color 0.3s ease;

    font-size: 1.2em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', Roboto, sans-serif;
    font-variant-numeric: tabular-nums; /* 強制等寬數字 */
}

.quantity.highlight {
    color: #E50046;
}

/* 調味選擇 */
.seasoning-section {
    margin-top: 30px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
}

.seasoning-title {
    color: #27ae60;
    margin-bottom: 15px;
    font-size: 1.4em;
}

.seasoning-grid {
    display: grid;
    gap: 20px;
}

.seasoning-group {
    display: flex;
    align-items: center;
    gap: 15px;
}

.seasoning-label {
    font-weight: 500;
    min-width: 60px;
}

.seasoning-select {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 100px;
    font-size: 14px;
}

.toppings-group {
    align-items: flex-start;
}

.toppings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.topping-option {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}

/* 結帳區 */
.checkout-section {
    margin-top: 30px;
    padding: 25px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid #e0e0e0;
}

.total-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.total-label {
    font-size: 1.3em;
    color: #2d3436;
    font-weight: 600;
}

.total-amount {
    font-size: 1.8em;
    color: #e74c3c;
    font-weight: bold;
    letter-spacing: 1px;

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', Roboto, sans-serif;
    font-variant-numeric: tabular-nums;
}

.submit-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #6c5ce7, #4b4bff);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.submit-btn:hover {
    background: linear-gradient(135deg, #4b4bff, #6c5ce7);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
}

.submit-btn:active {
    transform: translateY(0);
}

.submit-btn:disabled {
    background: linear-gradient(135deg, #a5a5a5, #808080);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.delay-notice {
  padding: 1.5rem;
  margin: 1rem 0;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.loading-icon {
  width: 24px;
  height: 24px;
  border: 3px solid #FF6B6B;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.delay-notice p {
  margin: 0;
  color: #856404;
  font-size: 0.95rem;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #ffffff;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>