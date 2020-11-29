<template src="./AppTemplate.html"></template>

<script>
    import AddExpense from './components/AddExpense.vue';
    import '@mdi/font/css/materialdesignicons.css';
    import 'vue-good-table/dist/vue-good-table.css';
    import {format} from 'date-fns';
    import GenerateRandomExpenses from './components/GenerateRandomExpenses';
    import Chart from 'chart.js';
    import _ from 'underscore';
    import randomColor from 'randomcolor';
    import ExpensesTable from './components/ExpensesTable';
    import {lineChartOptions, getExpensesArrayForPieChart, getExpensesByCategory, addColorsToPieChart, getDatesForLineChart, pieChartTooltips} from './services/chartServices';
    import {compareDateWithoutTime} from './services/generalServices';

    export default {
        name: 'App',
        components: {
            AddExpense,
            ExpensesTable,
            GenerateRandomExpenses
        },
        data() {
            return {
                expenses: [],
                clickedExpenses: [],
                pieChartObject: null,
                categoriesArray: [],
                pieChartMonth: null,
                lineChartObject: null,
                globalColors: [],
                lineChartMonth: null
            }
        },
        created() {
            this.expenses = JSON.parse(localStorage.getItem('tracker-expenses'));
            if (this.expenses == null) {
                this.expenses = [];
            } else {
                this.expenses.forEach((eachExpense, expenseIndex) => {
                    this.expenses[expenseIndex].expenseDate = new Date(eachExpense.expenseDate);
                });
            }
        },
        mounted() {
            if (this.expenses.length > 0) {
                this.createPieChart('pie-chart');
                this.createLineChart('line-chart');
            }
        },
        methods: {
            clearPieChartMonth(clickEvent) {
                this.pieChartMonth = null;
                this.changePieMonth(this.pieChartMonth);
            },
            clearLineChartMonth(clickEvent) {
                this.lineChartMonth = null;
                this.changeLineMonth(this.lineChartMonth);
            },
            deleteExpense(row, column, rowIndex, columnIndex) {
                if ((column.field == 'id')) {
                    const expenseRemover = eachExpense => eachExpense.id !== row.id;
                    this.expenses = this.expenses.filter(expenseRemover);
                    localStorage.setItem('tracker-expenses', JSON.stringify(this.expenses));
                    this.clickedExpenses = this.clickedExpenses.filter(expenseRemover);
                    this.updatePieChart(this.pieChartObject, this.expenses);
                    this.updateLineChart(this.lineChartObject);
                }
            },
            createLineChart(lineChartId) {
                const ctx = document.getElementById(lineChartId);
                const {
                    dateLabels,
                    lineChartDatasetArray
                } = this.getLineChartData()
                this.lineChartObject = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [...dateLabels],
                        datasets: [...lineChartDatasetArray]
                    },

                    options: lineChartOptions
                });
            },
            
            updatePieChart(chart, expensesArray) {
                if (this.pieChartObject) {
                    const newDataObject = this.getPieChartData(expensesArray);
                    chart.data.datasets = newDataObject.data.datasets;
                    chart.data.labels = newDataObject.data.labels;
                    chart.update();
                } else {
                    this.createPieChart('pie-chart');

                }
            },
            updateLineChart(chart) {
                if (this.lineChartObject) {
                    const {
                        dateLabels,
                        lineChartDatasetArray
                    } = this.getLineChartData();
                    chart.data.datasets = [...lineChartDatasetArray];
                    chart.data.labels = [...dateLabels];
                    chart.update();
                } else {
                    this.createLineChart('line-chart');
                }
            },
            changePieMonth(month) {
                this.updatePieChart(this.pieChartObject, this.expenses);
                this.clickedExpenses = [];
            },
            changeLineMonth(month) {
                this.updateLineChart(this.lineChartObject);
            },
            addExpense(expense) {
                expense.expenseDateString = format(expense.expenseDate, 'yyyy-MM-dd');
                this.expenses.push(expense);
                localStorage.setItem('tracker-expenses', JSON.stringify(this.expenses))
                this.updatePieChart(this.pieChartObject, this.expenses);
                this.updateLineChart(this.lineChartObject, this.expenses);
            },
            addRandomExpenses(randomExpenses) {
                this
                    .expenses
                    .push(...randomExpenses);
                localStorage.setItem('tracker-expenses', JSON.stringify(this.expenses));
                this.updatePieChart(this.pieChartObject, this.expenses);
                this.updateLineChart(this.lineChartObject, this.expenses);
            },
            getPieChartData(expensesArrayInput) {
                const expensesArray = getExpensesArrayForPieChart(expensesArrayInput, this.pieChartMonth);
                let dataForChart = {};
                dataForChart.data = {};
                dataForChart.data.datasets = [];

                this.categoriesArray = _.keys(_.countBy(expensesArray, function (expense) {
                    return expense.category;
                }));
                dataForChart.data.labels = this.categoriesArray;

                // let arrayOfExpensesSortedByCategory = [];
                let expenseDataset = {};
                expenseDataset.label = "Expenses by category";
                // group expenses by category
                const expensesByCategory = getExpensesByCategory(this.categoriesArray, expensesArray);

                dataForChart.data.datasets.push(expenseDataset);

                expenseDataset.data = expensesByCategory.map(eachCatExpense => eachCatExpense.totalCategoryExpense);

                addColorsToPieChart(this.pieChartObject, this.categoriesArray, this.globalColors, expenseDataset);

                return dataForChart;
            },
            createPieChart(chartId) {
                const ctx = document.getElementById(chartId);
                const calculatedDataForChart = this.getPieChartData(this.expenses);
                this.pieChartObject = new Chart(ctx, {
                    type: 'pie',
                    data: calculatedDataForChart.data,
                    options: {
                        responsive: true,
                        lineTension: 1,
                        onClick: (evt, item) => {
                            if (item.length > 0) {
                                const itemIndex = item
                                    .pop()
                                    ._index;
                                const categoricalFilter = eachExpense => eachExpense.category === this
                                    .categoriesArray[itemIndex] && (
                                        this.pieChartMonth == null ||
                                        eachExpense
                                        .expenseDate
                                        .getMonth() === this
                                        .pieChartMonth
                                        .getMonth());
                                this.clickedExpenses = this
                                    .expenses
                                    .filter(categoricalFilter);
                            }
                        },
                        tooltips: pieChartTooltips
                    }
                });
            },
            getLineChartData() {
                
                let dateLabels = getDatesForLineChart(this.lineChartMonth, this.expenses);

                // let categoricalExpenses = [];
                let lineChartDatasetArray = [];
                this.categoriesArray.forEach((eachCategory, catIndex) => {
                    
                    let expensesForDates = [];
                    dateLabels.forEach(eachDate => {
                        let dateAndCategoryFilter = eachExpense => {
                            return eachExpense.category === eachCategory && compareDateWithoutTime(eachExpense.expenseDate,eachDate);
                        }
                        let dateAndCategoryExpenseReducer = (initial, newExpense) => (initial +
                            newExpense.amountValue);
                        let filteredExpenses = this.expenses.filter(dateAndCategoryFilter);
                        // const sum = filteredExpenses.reduce(dateAndCategoryExpenseReducer,0);
                        let sum = 0;
                        filteredExpenses.forEach(eachExpense => {
                            sum+=eachExpense.amountValue
                        });
                        // console.log(sum);
                            // console.log(newExpense);
                        expensesForDates.push(sum);
                    });
                    lineChartDatasetArray.push({
                        label: eachCategory,
                        backgroundColor: this.globalColors[catIndex],
                        borderColor: this.globalColors[catIndex],
                        data: [...expensesForDates],
                        fill: false,
                        lineTension: 0,
                        cubicInterpolationMode: 'linear',
                        hidden: true
                    });

                });
                // const randomOverallColor = randomColor();
                lineChartDatasetArray.unshift({
                    label: "Overall",
                    backgroundColor: "black",
                    borderColor: "black",
                    data: [..._.unzip(lineChartDatasetArray.map(eachLineChartDataset => eachLineChartDataset
                        .data)).map(eachDayArray => eachDayArray.reduce((a, b) => a + b, 0))],
                    fill: false,
                    lineTension: 0,
                    cubicInterpolationMode: 'linear'
                });
                return {
                    dateLabels,
                    lineChartDatasetArray
                };
            },
        }
        
    }
</script>

<style></style>