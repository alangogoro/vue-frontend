<template>
  <div id="app">
    <h1 class="header">三重埔鹽酥雞</h1>
    
    <!-- 菜單分類區塊 -->
    <div v-for="category in categories" :key="category.name" class="menu-category">
      <h2 class="category-title">{{ category.name }}</h2>
      <div class="menu-items">
        <div v-for="(item, index) in category.items" :key="index" class="menu-item">
          <!-- 有規格的商品 -->
          <div v-if="item.sizes" class="item-with-size">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <select v-model="item.selectedSize" class="size-select" @change="updateTotal">
                <option v-for="(size, sizeIndex) in item.sizes" 
                        :key="sizeIndex"
                        :value="sizeIndex">
                  {{ size.label }} ${{ size.price }}
                </option>
              </select>
            </div>
            <div class="quantity-control">
              <button class="qty-btn" @click="decreaseQuantity(category.name, index)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="qty-btn" @click="increaseQuantity(category.name, index)">+</button>
            </div>
          </div>

          <!-- 單一價格商品 -->
          <div v-else class="simple-item">
            <span class="item-name">{{ item.name }} ${{ item.price }}</span>
            <div class="quantity-control">
              <button class="qty-btn" @click="decreaseQuantity(category.name, index)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="qty-btn" @click="increaseQuantity(category.name, index)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 調味選擇區塊 -->
    <div class="seasoning-section">
      <h2 class="seasoning-title">調味選擇</h2>
      <div class="seasoning-grid">
        <div class="seasoning-group">
          <label class="seasoning-label">辣度：</label>
          <select v-model="seasoning.spiciness" class="seasoning-select">
            <option v-for="opt in spicinessOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="seasoning-group">
          <label class="seasoning-label">粉類：</label>
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

    <!-- 結帳區塊 -->
    <div class="checkout-section">
      <div class="total-display">
        <span class="total-label">總金額：</span>
        <span class="total-amount">${{ total }}</span>
      </div>
      <button class="submit-btn" @click="submitOrder">送出訂單</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categories: [
        {
          name: '肉食類',
          items: [
            { 
              name: '鹽酥雞（無骨）',
              sizes: [
                { label: '小份', price: 65 },
                { label: '大份', price: 115 }
              ],
              selectedSize: 0,
              quantity: 0
            },
            { 
              name: '深海魷魚',
              sizes: [
                { label: '小份', price: 70 },
                { label: '大份', price: 115 }
              ],
              selectedSize: 0,
              quantity: 0
            },
            { name: '香酥雞軟骨', price: 60, quantity: 0 },
            { name: '香滷雞屁股（兩串）', price: 45, quantity: 0 },
            { name: '雞米花', price: 50, quantity: 0 },
            { name: '麥克雞塊', price: 50, quantity: 0 }
          ]
        },
        {
          name: '蔬菜類',
          items: [
            { name: '酥脆榴瓜條', price: 45, quantity: 0 },
            { name: '杏鮑菇', price: 55, quantity: 0 },
            { name: '花椰菜', price: 45, quantity: 0 },
            { name: '玉米筍', price: 45, quantity: 0 },
            { name: '四季豆', price: 45, quantity: 0 }
          ]
        },
        {
          name: '配著吃更好吃',
          items: [
            { name: '純芋泥球', price: 45, quantity: 0 },
            { name: '流沙芋泥球', price: 55, quantity: 0 },
            { name: '加拿大脆薯', price: 45, quantity: 0 },
            { name: '百頁豆腐', price: 35, quantity: 0 },
            { name: '花枝丸', price: 40, quantity: 0 },
            { name: '雞蛋豆腐', price: 45, quantity: 0 },
            { name: '小熱狗', price: 35, quantity: 0 },
            { name: '米血糕', price: 25, quantity: 0 },
            { name: '甜不辣', price: 40, quantity: 0 }
          ]
        }
      ],
      seasoning: {
        spiciness: '不辣',
        powder: '胡椒粉',
        toppings: []
      },
      spicinessOptions: ['不辣', '小辣', '中辣', '大辣'],
      powderOptions: ['胡椒粉', '梅粉'],
      toppingOptions: ['蔥花', '蒜粒', '洋蔥', '九層塔']
    }
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
    }
  },
  methods: {
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
    submitOrder() {
      const orderItems = this.categories.flatMap(category => 
        category.items.filter(item => item.quantity > 0).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.sizes ? item.sizes[item.selectedSize].price : item.price,
          size: item.sizes ? item.sizes[item.selectedSize].label : '單份'
        }))
      )

      const orderData = {
        items: orderItems,
        seasoning: this.seasoning,
        total: this.total
      }

      console.log('訂單內容:', orderData)
      alert('訂單已送出！請至櫃台結帳')
      
      axios.post('https://flask-backend-si0h.onrender.com/api/send-to-line', {
        order: this.formatOrderText(orderData)
      })
    },
    formatOrderText(orderData) {
      let text = '=== 訂單內容 ===\n'
      orderData.items.forEach(item => {
        text += `${item.name} ${item.size} x${item.quantity} $${item.price * item.quantity}\n`
      })
      text += '\n調味選擇：\n'
      text += `辣度：${orderData.seasoning.spiciness}\n`
      text += `粉類：${orderData.seasoning.powder}\n`
      text += `配料：${orderData.seasoning.toppings.join(', ')}\n`
      text += `\n總金額：$${orderData.total}`
      return text
    }
  }
}
</script>

<style>
/* 基礎樣式 */
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

/* 標題 */
.header {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.2em;
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
  color: #e74c3c;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 1.4em;
}

/* 商品項目 */
.menu-items {
  display: grid;
  gap: 15px;
}

.item-with-size, .simple-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background 0.2s;
}

.item-with-size:hover, .simple-item:hover {
  background: #f0f0f0;
}

.item-name {
  font-weight: 500;
  color: #34495e;
  flex: 1;
}

.size-select {
  margin-left: 15px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

/* 數量控制 */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
}

.qty-btn {
  padding: 8px 15px;
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
  min-width: 30px;
  text-align: center;
  font-weight: bold;
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
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 200px;
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
  font-weight: 700;
  letter-spacing: 1px;
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
</style>
