<template>
  <div id="app">
    <h1>餐廳點餐系統</h1>
    <table>
      <thead>
        <tr>
          <th>菜名</th>
          <th>單價</th>
          <th>數量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in menu" :key="index">
          <td>{{ item.name }}</td>
          <td>${{ item.price }}</td>
          <td>
            <button @click="decreaseQuantity(index)" :disabled="item.quantity === 0">-</button>
            {{ item.quantity }}
            <button @click="increaseQuantity(index)" :disabled="item.quantity === 50">+</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="total">
      <h2>總額: ${{ total }}</h2>
    </div>
    <button @click="submitOrder">送出訂單</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      menu: [
        { name: '無骨鹽酥雞', price: 60, quantity: 0 },
        { name: '雞皮', price: 45, quantity: 0 },
        { name: '花椰菜', price: 45, quantity: 0 },
      ],
    };
  },
  computed: {
    total() {
      return this.menu.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
  },
  methods: {
    increaseQuantity(index) {
      if (this.menu[index].quantity < 50) {
        this.menu[index].quantity++;
      }
    },
    decreaseQuantity(index) {
      if (this.menu[index].quantity > 0) {
        this.menu[index].quantity--;
      }
    },
    async submitOrder() {
      const order = this.menu
        .filter(item => item.quantity > 0)
        .map(item => `${item.name} * ${item.quantity}`)
        .join('\n');

      if (order) {
        try {
          await axios.post(
            'https://api.line.me/v2/bot/message/push',
            {
              to: 'U31c60fab991b24e39158de3aed3d952e', // 替換為你的 Line User ID
              messages: [
                {
                  "type":"text",
                  "text":"Hello, world1"
                },
                {
                  "type":"text",
                  "text":"Hello, world2"
                }
              ],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer GRUoQGGd9Ul1rb1jGfvKLln9J1Ov/EUFh2Ze9ZLKw7vqcNm7lZta91YAjluaSm0zu5Y+L3ihBEOS9SGuEQzLn+yj73mTKKr6GpHrWMnlCXWD0hwE07vm3qb9q7Snxk8y2V2mqK9z02NQ8T5rcB8+IQdB04t89/1O/w1cDnyilFU=', // 替換為你的 Channel Access Token
              },
            }
          );
          alert('訂單已傳送至 Line！');
        } catch (error) {
          console.error('傳送失敗:', error);
          alert('傳送失敗，請稍後再試！', error);
        }
      } else {
        alert('請選擇至少一道菜！');
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}

button {
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  margin: 0 5px;
}

.total {
  margin-bottom: 20px;
}
</style>
