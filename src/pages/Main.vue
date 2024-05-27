<template>
    <div class="main-container">
        <div class="wallet-section">
            <button class="wallet-button" @click="connectionWallet"> Подключить Metamask</button>
            <div>Адрес пользователя: {{ $store.state.address }}</div> 
            <div>ID цепочки: {{ $store.state.chainId }}</div>
            <div>Пользователь админ: {{ $store.state.admin }}</div>
        </div>
        <new-message v-if="$store.state.admin && !$store.state.newMessage"></new-message>
        <message-for-sign v-if="$store.state.admin && $store.state.newMessage"></message-for-sign>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import MessageForSign from '@/components/MessageForSign.vue';
import NewMessage from '@/components/NewMessage.vue';

export default {
    components: {
        MessageForSign,
        NewMessage 
    },
    methods: {
        ...mapActions({
            connectionWallet: 'connectionWallet'
        })
    }
}
</script>

<style scoped>
.main-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wallet-section {
    margin-bottom: 20px;
}

.wallet-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 0px 0px 20px 0px;
}

.wallet-button:hover {
    background-color: #45a049;
}
</style>