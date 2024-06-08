<template>
    <div class="new-message-container">
        <div class="header">Создать новое сообщение на подпись</div>
        <div class="input-group">
            <div class="input-container">
                <input class="input-field" v-model="targetAddress" placeholder="Введите адрес контракта">
            </div>
            <div class="input-container">
                <input class="input-field" v-model="functionName" placeholder="Введите имя функции">
            </div>
            <div class="input-container">
                <input class="input-field" v-model="argsCount" placeholder="Введите количество аргументов">
            </div>
        </div>
        <input-args
            v-for="id in argsId"
            :key="id"
            :id="id"
            @changeType="changeType"
            @inputArg="inputArg"
        /> 
        <div class="button-container">
            <button class="create-button" @click="nMessage">Создать и подписать сообщение</button>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import InputArgs from './InputArgs.vue'

export default {
    components: {
        InputArgs
    },
    name: "new-message",
    data() {
        return {
            targetAddress: "",
            functionName: "",
            argsCount: "",
            argsId: [],
            arguments: {
                types: [],
                args: []
            }
        }
    },
    methods: {
        ...mapActions({
            newMessage: "newMessage"
        }),
        changeType(type) {
            console.log('abc') 
            console.log(type)
            this.arguments.types[type.id] = type.type
        },
        inputArg(arg) {
            console.log(arg)
            this.arguments.args[arg.id] = arg.arg
            console.log(this.arguments)
        },
        async nMessage() { 
            await this.newMessage([this.targetAddress, this.functionName, this.arguments])
        }
    },
    watch: {
        argsCount() {
            this.argsId = []
            for(let i = 0; i < this.argsCount; i++) {
                this.argsId.push(i)
            }
            this.arguments.types = new Array(this.argsCount)
            this.arguments.args = new Array(this.argsCount)
        }
    }
}
</script>

<style scoped>
.new-message-container {
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

.input-group {
    margin-bottom: 20px;
}

.input-container {
    margin-bottom: 10px;
}

.input-field {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.button-container {
    text-align: right;
}

.create-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.create-button:hover {
    background-color: #45a049;
}
</style>