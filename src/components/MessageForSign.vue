<template>
    <div class="message-for-sign-container">
        <div class="header">Это форма для подписи сообщения</div>
        <div class="message-details">
            <div>Адрес целевого контракта: {{ $store.state.message.targetAddress }}</div>
            <div>Имя функции: {{ $store.state.message.functionName }}</div>
            <div>Аргументы: {{ $store.state.message.functionArgs }}</div>
            <div>nonce: {{ $store.state.message.nonce }}</div>
            <div>payload: {{ $store.state.message.payload }}</div>
            <div>message: {{ $store.state.message.message }}</div>
            <div>signers: {{ $store.state.message.signers }}</div>
            <div>signatures: {{ $store.state.message.signatures }}</div>
        </div>
        <div class="button-group">
            <button class="sign-button" @click="signMessage">Подписать</button>
            <button v-if="$store.state.enoughSignatures" class="send-button" @click="sendMessage">Отправить</button>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: "message-for-sign",
    methods: {
        ...mapActions({
            signMessage: "signMessage",
            sendMessage: "sendMessage"
        }),
    }
}
</script>

<style scoped>
.message-for-sign-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.message-details {
    margin-bottom: 20px;
}

.button-group {
    text-align: right;
}

.sign-button,
.send-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
}

.sign-button:hover,
.send-button:hover {
    background-color: #45a049;
}
</style>