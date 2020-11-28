<template>
    <!-- <div id="app" class="container">
        
    </div> -->

    <div class="columns">
        <div class="column">
            <div class="columns card" style="margin: 2%">
                <div class="column is-one-half" style="text-align: center">
                    <AddExpense v-on:add-expense="addExpense" />
                </div>
                <div class="column is-one-half" style="text-align: center">
                    <GenerateRandomExpenses v-on:add-random-expenses="addRandomExpenses" />
                </div>
            </div>
            <div v-show="expenses.length > 0"  class="card" style="margin-left: 2%; margin-right: 2%; padding: 3%">
                <b-table default-sort="expenseDate" v-if="expenses.length > 0" :show-detail-icon="false" per-page="10" detailed pagination-rounded
                    :data="expenses" v-on:cellclick="deleteExpense" paginated>
                    <b-table-column label="Expense" field="title" sortable v-slot="props">
                        <span>

                            {{props.row.title}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Category" field="category" sortable v-slot="props">
                        <span>
                            {{props.row.category}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Amount" field="amountValue" sortable v-slot="props">
                        <span>
                            {{props.row.amountValue}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Date" field="expenseDateString" sortable v-slot="props">
                        <span>
                            {{props.row.expenseDateString}}
                        </span>
                    </b-table-column>
                    <b-table-column field="id">
                        <span>
                            <b-icon icon="trash-can-outline" size="is-small"></b-icon>
                        </span>
                    </b-table-column>

                </b-table>
            </div>
            <div class="card" v-show="expenses.length > 0" style="margin-left: 2%; margin-right: 2%; margin-top: 2%; padding: 3%">
                <b-field v-if="expenses.length > 0" label="Month" label-position="on-border">
                    <b-datepicker v-if="expenses.length > 0" v-model="lineChartMonth" v-on:change-month="changeLineMonth"
                        type="month" icon="calendar-today" trap-focus></b-datepicker>
                </b-field>
                <canvas id="line-chart"></canvas>
            </div>
        </div>
        <div class="column">
            <div v-show="expenses.length > 0" class="card" style="padding: 3%; margin-top: 2%">
                <b-field v-if="expenses.length > 0" label="Month" label-position="on-border">
                    <b-datepicker v-if="expenses.length > 0" v-model="pieChartMonth" v-on:change-month="changePieMonth"
                        type="month" icon="calendar-today" trap-focus></b-datepicker>
                </b-field>
                <canvas v-show="expenses.length > 0" id="pie-chart"></canvas>
                <b-table default-sort="expenseDate" v-if="clickedExpenses.length > 0" :data="clickedExpenses"
                    per-page="5" detailed pagination-rounded :show-detail-icon="false" v-on:cellclick="deleteExpense"
                    paginated>
                    <b-table-column label="Expense" field="title" sortable v-slot="props">
                        <span>

                            {{props.row.title}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Category" field="category"  sortable v-slot="props">
                        <span>
                            {{props.row.category}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Amount" field="amountValue" sortable v-slot="props">
                        <span>
                            {{props.row.amountValue}}
                        </span>
                    </b-table-column>
                    <b-table-column label="Date" sortable field="expenseDate" v-slot="props">
                        <span>
                            {{props.row.expenseDateString}}
                        </span>
                    </b-table-column>
                    <b-table-column field="id">
                        <span>
                            <b-icon icon="trash-can-outline" size="is-small"></b-icon>
                        </span>
                    </b-table-column>
                </b-table>
                <!-- <VueGoodTable :columns="columns" :rows="" /> -->
            </div>
        </div>
    </div>

</template>

<script>
    import AddExpense from './components/AddExpense.vue';
    import '@mdi/font/css/materialdesignicons.css';
    import 'vue-good-table/dist/vue-good-table.css';
    // import {     VueGoodTable } from 'vue-good-table';
    import {
        format
    } from 'date-fns';
    import GenerateRandomExpenses from './components/GenerateRandomExpenses';
    import pieChartData from './chart-data.js';
    import Chart from 'chart.js';
    import _ from 'underscore';
    import randomColor from 'randomcolor';

    export default {
        name: 'App',
        components: {
            AddExpense,
            // VueGoodTable,
            GenerateRandomExpenses
        },
        mounted() {
            if (this.expenses.length > 0) {
                this.createPieChart('pie-chart', this.pieChartData);
                this.createLineChart('line-chart');
            }
        },
        methods: {
            deleteExpense(row, column, rowIndex, columnIndex) {
                if ((column.field == 'id')) {
                    const expenseRemover = eachExpense => eachExpense.id !== row.id;
                    this.expenses = this.expenses.filter(expenseRemover);
                    this.clickedExpenses = this.clickedExpenses.filter(expenseRemover);
                    this.updatePieChart(this.pieChartObject, this.expenses);
                }
            },
            getLineChartData() {
                let expenseDates;
                if (this.lineChartMonth) {
                    expenseDates = [];
                    let newExpenseDate = new Date (this.lineChartMonth.getTime());
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
                    let arr=[];
                    for(let dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
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
                            return eachExpense.category === eachCategory && eachExpense.expenseDate.getTime() === eachDate.getTime();
                        }
                        let dateAndCategoryExpenseReducer = (initial, newExpense) => (initial + newExpense.amountValue);
                        let filteredExpenses = this.expenses.filter(dateAndCategoryFilter);
                        expensesForDates.push(filteredExpenses.reduce(dateAndCategoryExpenseReducer, 0));
                    });
                    lineChartDatasetArray.push({
                            label: eachCategory,
                            backgroundColor: this.globalColors[catIndex],
                            borderColor: this.globalColors[catIndex],
                            data: [...expensesForDates],
                            fill: false,
                            lineTension: 0,
                            cubicInterpolationMode: 'linear'
                        });

                });
                return {dateLabels, lineChartDatasetArray};
            },
            createLineChart(lineChartId) {
                const ctx = document.getElementById(lineChartId);
                const {dateLabels, lineChartDatasetArray} = this.getLineChartData()
                this.lineChartObject = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [...dateLabels],
                        datasets: [...lineChartDatasetArray]
                    },
                    
                    options: {
                        onClick: function(event, activeElements) {
                            console.log(event);
                            console.log(activeElements); 
                        },
                        scales: {
                            xAxes: [{
                                type: 'time',
                                distribution: 'series'
                            }],
                            yAxes: [{
                                ticks: {
                                    callback: function(value, index, values) {
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
                                label: function(tooltipItem, data) {
                                    let label = data.datasets[tooltipItem.datasetIndex].label 
                                        + ": S$" 
                                        + new Intl.NumberFormat('en-US').format(tooltipItem.value) || '';
                                    return label;
                                },
                                title: function(tooltipItem, data) {
                                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                                    return new Date(tooltipItem[0].label).toLocaleDateString('en-GB', options);
                                }
                            }
                        }
                    }
                });
            },
            createPieChart(chartId, chartData) {
                const ctx = document.getElementById(chartId);
                const calculatedDataForChart = this.getChartData(this.expenses);
                this.pieChartObject = new Chart(ctx, {
                    type: chartData.type,
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
                                label: function(tooltipItem, data) {
                                    let label = data.labels[tooltipItem.index] 
                                        + ": S$" 
                                        + new Intl.NumberFormat('en-US').format(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) || '';
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
                    this.createPieChart('pie-chart', this.pieChartData);
                    
                }
            },
            updateLineChart(chart) {
                if (this.lineChartObject) {
                    const {dateLabels, lineChartDatasetArray} = this.getLineChartData();
                    chart.data.datasets = [...lineChartDatasetArray];
                    chart.data.labels = [...dateLabels];
                    chart.update();
                } else {
                    this.createLineChart('line-chart');   
                }
            },
            changePieMonth(month) {
                // console.log(month);
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
                const expensesArray = this.pieChartMonth ? expensesArrayInput.filter(monthlyExpenseFilter) : [...expensesArrayInput];
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
                this
                    .expenses
                    .push(expense);
                this.updatePieChart(this.pieChartObject, this.expenses);
                this.updateLineChart(this.lineChartObject, this.expenses);
            },
            addRandomExpenses(randomExpenses) {
                this
                    .expenses
                    .push(...randomExpenses);
                this.updatePieChart(this.pieChartObject, this.expenses);
                this.updateLineChart(this.lineChartObject, this.expenses);
            }
        },
        data() {
            return {
                expenses: [],
                clickedExpenses: [],
                pieChartData: pieChartData,
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