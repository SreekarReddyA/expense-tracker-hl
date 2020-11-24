<template>
  <div id="app">
    <AddExpenseView v-on:add-expense="addExpense" />
    <VueGoodTable :columns="columns"
      :rows="expenses"/>
  </div>
</template>

<script>
  import AddExpenseView from './views/AddExpenseView.vue';
  import '@mdi/font/css/materialdesignicons.css';
  import 'vue-good-table/dist/vue-good-table.css'
  import { VueGoodTable } from 'vue-good-table';
  import {format} from 'date-fns'

 
// add to component


  export default {
    name: 'App',
    data() {
      return {
        expenses: [],
        columns: [
        {
          label: 'Expense',
          field: 'title',
        },
        {
          label: 'Currency',
          field: 'currency',
        },
        {
          label: 'Category',
          field: 'category',
        },
        {
          label: 'Amount',
          field: 'amountValue',
        },
        {
          label: 'Date',
          field: 'expenseDate',
          type: 'Date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'MMM do yy',
        }
      ]
      }
    },
    components: {
      AddExpenseView,
      VueGoodTable
    },
    methods: {
      addExpense(expense) {
        expense.expenseDate = format(expense.expenseDate, 'yyyy-MM-dd');
        this.expenses.push(expense);
        // console.log(new Date(expense.expenseDate));
      }
    }
  }
</script>

<style>

</style>