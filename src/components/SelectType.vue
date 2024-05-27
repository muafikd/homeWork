<template>
    <div class="select-type-container">
        <!-- <div class="header">Это форма для выбора типа</div> -->
        {{ id }}
        <select class="select-field" @change="changeOption">
            <option value="">Выберите тип данных</option>
            <option
                v-for="option in options"
                :key="option"
            >
                {{ option }}
            </option>
        </select>
    </div>
</template>

<script>

export default {
    name: "select-type",
    props: {
        options: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        changeOption(event) {
            this.$emit("changeType", event.target.value)
        }
    }
}
</script>

<style scoped>
.select-type-container {
    margin-bottom: 10px;
}

.header {
    font-size: 16px;
    margin-bottom: 10px;
}

.select-field {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>