<template>
    <div id="app">
        <AddExpenseView v-on:add-expense="addExpense"/>
        <GenerateRandomExpenses v-on:add-random-expenses="addRandomExpenses"/>
        <VueGoodTable :columns="columns" :rows="expenses"/>
        <canvas id="planet-chart"></canvas>
    </div>
</template>

<script>
    import AddExpenseView from './views/AddExpenseView.vue';
    import '@mdi/font/css/materialdesignicons.css';
    import 'vue-good-table/dist/vue-good-table.css';
    import {VueGoodTable} from 'vue-good-table';
    import {format} from 'date-fns';
    import GenerateRandomExpenses from './components/GenerateRandomExpenses';
    import planetChartData from './chart-data.js';
    import Chart from 'chart.js';
    import _ from 'underscore';
    import randomColor from 'randomcolor';

    export default {
        name : 'App',
        components : {
            AddExpenseView,
            VueGoodTable,
            GenerateRandomExpenses
        },
        mounted() {
            this.createChart('planet-chart', this.planetChartData);
        },
        methods : {
            createChart(chartId, chartData) {
                const ctx = document.getElementById(chartId);
                const calculatedDataForChart = this.getChartData(this.expenses);
                this.chartObject = new Chart(ctx, {
                    type: chartData.type,
                    data: calculatedDataForChart.data,
                    options: chartData.options
                });
            },
            updateChart(chart, expensesArray) {
                const newDataObject = this.getChartData(expensesArray);
                chart.data.datasets = newDataObject.data.datasets;
                chart.data.labels = newDataObject.data.labels;
                chart.update();
            },
            getChartData(expensesArray) {

                let dataForChart = {};
                dataForChart.data = {};
                dataForChart.data.datasets = [];

                let categories = _.keys(_.countBy(expensesArray, function (expense) {
                    return expense.category;
                }));
                dataForChart.data.labels = categories;

                // let arrayOfExpensesSortedByCategory = [];
                let expenseDataset = {};
                expenseDataset.label = "Expenses by category";
                // group expenses by category
                const expensesByCategory = categories.map(eachCategory => {
                    let categoricalExpensesArray = expensesArray.filter(eachExpense => eachExpense.category === eachCategory);
                    const totalExpenseReducer = (totalCatExpense, currentExpense) => totalCatExpense + currentExpense.amountValue;
                    return {
                        category: eachCategory,
                        expenses: categoricalExpensesArray,
                        totalCategoryExpense: categoricalExpensesArray.reduce(totalExpenseReducer, 0)
                    }
                });

                dataForChart
                    .data
                    .datasets
                    .push(expenseDataset);

                expenseDataset.data = expensesByCategory.map(eachCatExpense => eachCatExpense.totalCategoryExpense);
                if (this.chartObject) {
                    if (this.chartObject.data.datasets) {
                        const newColorsArray = [...this.chartObject.data.datasets[0].backgroundColor];
                        newColorsArray.push(...randomColor({
                            count: categories.length - newColorsArray.length
                        }));
                        expenseDataset.backgroundColor = [...newColorsArray];
                    } else {
                        expenseDataset.backgroundColor = randomColor({count: categories.length});
                    }
                } else {
                    expenseDataset.backgroundColor = randomColor({count: categories.length});
                }

                return dataForChart;
            },
            addExpense(expense) {
                expense.expenseDate = format(expense.expenseDate, 'yyyy-MM-dd');
                this
                    .expenses
                    .push(expense);
                this.updateChart(this.chartObject, this.expenses);
            },
            addRandomExpenses(randomExpenses) {
                this
                    .expenses
                    .push(...randomExpenses);
                this.updateChart(this.chartObject, this.expenses);
            }
        },
        data() {
            return {
                expenses: [],
                columns: [
                    {
                        label: 'Expense',
                        field: 'title'
                    }, {
                        label: 'Currency',
                        field: 'currency'
                    }, {
                        label: 'Category',
                        field: 'category'
                    }, {
                        label: 'Amount',
                        field: 'amountValue'
                    }, {
                        label: 'Date',
                        field: 'expenseDate',
                        type: 'Date',
                        dateInputFormat: 'yyyy-MM-dd',
                        dateOutputFormat: 'yyyy-MM-dd'
                    }
                ],
                planetChartData: planetChartData,
                chartObject: null
            }
        }
    }
</script>

<style></style>