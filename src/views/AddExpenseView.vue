<template>
    <div>
        <AddExpense v-on:add-expense="addExpense"/>
    </div>
</template>

<script>
import AddExpense from '../components/AddExpense'
export default {
    name: 'AddExpenseView',
    components: {
        AddExpense
    },
    methods: {
        addExpense(expense) {
            this.$emit('add-expense', expense);
        }
    }
}
</script>