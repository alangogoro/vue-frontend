import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import IntervalSetting from '@/components/IntervalSetting.vue';

const routes = [
  {
    path: '/waiting_time',
    name: 'IntervalSetting',
    component: IntervalSetting
  },
  {
    path: '/',
    name: 'App',
    component: App
  }
];

const router = createRouter({ history: createWebHistory(), routes });

const app = createApp(App);
app.use(router);
app.mount('#app');
