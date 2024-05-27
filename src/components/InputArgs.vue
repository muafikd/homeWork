<template>
    <div class="input-args-container">
        <div class="header">Это форма для ввода аргументов</div>
        <select-type
            @changeType="changeType"
            :options=options
        />
        <input
            class="input-field"
            placeholder="Введите значение аргумента"
            v-model="argument"
        />
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import SelectType from "./SelectType.vue"

export default {
    components: {
        SelectType
    },
    name: "input-args",
    data() {
        return {
            argument: "",
            options: ["string", "uint256"]
        }
    },
    props: {
        id: {
            type: Number,
        }
    },
    methods: {
        ...mapActions({
            
        }),
        changeType(type) {
            this.argument = ''
            const types = {
                id: this.id,
                type: type
            }
            this.$emit("changeTypes", types)
        }
    },
    watch: {
        argument() {
            const arg = {
                id: this.id,
                arg: this.argument
            }
            this.$emit("inputArg", arg)
        }
    }
}
</script>

<style scoped>
.input-args-container {
    margin-bottom: 20px;
}

.header {
    font-size: 16px;
    margin-bottom: 10px;
}

.input-field {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>