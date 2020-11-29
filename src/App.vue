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

    export default {
        name: 'App',
        components: {
            AddExpense,
            ExpensesTable,
            GenerateRandomExpenses
        },
        created() {
            this.expenses = [...JSON.parse(localStorage.getItem('tracker-expenses'))];
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
                }
            },
            getLineChartData() {
                let expenseDates;
                if (this.lineChartMonth) {
                    expenseDates = [];
                    let newExpenseDate = new Date(this.lineChartMonth.getTime());
                    while (this.lineChartMonth.getMonth() === newExpenseDate.getMonth()) {
                        expenseDates.push(new Date(newExpenseDate.getTime()))
                        newExpenseDate.setDate(newExpenseDate.getDate() + 1);
                    }
                } else {
                    expenseDates = this.expenses.map(eachExpense => eachExpense.expenseDate);
                }

                let minimumDate = _.min(expenseDates);
                let maximumDate = _.max(expenseDates);
                let getDaysArray = (start, end) => {
                    let arr = [];
                    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
                        arr.push(new Date(dt));
                    }
                    return arr;
                };
                let dateLabels = getDaysArray(minimumDate, maximumDate);

                // let categoricalExpenses = [];
                let lineChartDatasetArray = [];

                this.categoriesArray.forEach((eachCategory, catIndex) => {
                    let expensesForDates = [];
                    dateLabels.forEach(eachDate => {
                        let dateAndCategoryFilter = eachExpense => {
                            return eachExpense.category === eachCategory && eachExpense.expenseDate
                                .getTime() === eachDate.getTime();
                        }
                        let dateAndCategoryExpenseReducer = (initial, newExpense) => (initial +
                            newExpense.amountValue);
                        let filteredExpenses = this.expenses.filter(dateAndCategoryFilter);
                        expensesForDates.push(filteredExpenses.reduce(dateAndCategoryExpenseReducer,
                        0));
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

                    options: {
                        onClick: function (event, activeElements) {
                            console.log("new feature to be added here");
                        },
                        scales: {
                            xAxes: [{
                                type: 'time',
                                distribution: 'series'
                            }],
                            yAxes: [{
                                ticks: {
                                    callback: function (value, index, values) {
                                        return new Intl.NumberFormat('en-US').format(value);
                                    },
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: "S$"
                                }
                            }]
                        },
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    let label = data.datasets[tooltipItem.datasetIndex].label +
                                        ": S$" +
                                        new Intl.NumberFormat('en-US').format(tooltipItem.value) || '';
                                    return label;
                                },
                                title: function (tooltipItem, data) {
                                    const options = {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    };
                                    return new Date(tooltipItem[0].label).toLocaleDateString('en-GB',
                                        options);
                                }
                            }
                        }
                    }
                });
            },
            createPieChart(chartId) {
                const ctx = document.getElementById(chartId);
                const calculatedDataForChart = this.getChartData(this.expenses);
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
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    let label = data.labels[tooltipItem.index] +
                                        ": S$" +
                                        new Intl.NumberFormat('en-US').format(data.datasets[tooltipItem
                                            .datasetIndex].data[tooltipItem.index]) || '';
                                    return label;
                                }
                            }
                        }
                    }
                });
            },
            updatePieChart(chart, expensesArray) {
                if (this.pieChartObject) {
                    const newDataObject = this.getChartData(expensesArray);
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

            getChartData(expensesArrayInput) {
                const monthlyExpenseFilter = (eachExpense) => {
                    return eachExpense
                        .expenseDate
                        .getMonth() === this
                        .pieChartMonth
                        .getMonth();
                }
                console.log(this.pieChartMonth);
                const expensesArray = this.pieChartMonth ? expensesArrayInput.filter(monthlyExpenseFilter) : [...
                    expensesArrayInput
                ];
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
                const expensesByCategory = this
                    .categoriesArray
                    .map(eachCategory => {
                        let categoricalExpensesArray = expensesArray.filter(eachExpense => eachExpense.category ===
                            eachCategory);
                        const totalExpenseReducer = (totalCatExpense, currentExpense) => totalCatExpense +
                            currentExpense.amountValue;
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
                if (this.pieChartObject) {
                    if (this.pieChartObject.data.datasets) {
                        const newColorsArray = [...this.pieChartObject.data.datasets[0].backgroundColor];
                        newColorsArray.push(...randomColor({
                            count: this.categoriesArray.length - newColorsArray.length
                        }));
                        expenseDataset.backgroundColor = [...newColorsArray];
                    } else {
                        expenseDataset.backgroundColor = randomColor({
                            count: this.categoriesArray.length
                        });
                    }
                } else {
                    expenseDataset.backgroundColor = randomColor({
                        count: this.categoriesArray.length
                    });
                }

                this.globalColors = [...expenseDataset.backgroundColor];

                return dataForChart;
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
            }
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
        }
    }
</script>

<style></style>