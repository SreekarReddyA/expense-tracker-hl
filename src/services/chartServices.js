import _ from 'underscore';
import randomColor from 'randomcolor';

export const lineChartOptions = {
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

export const getExpensesArrayForPieChart = (expensesArrayInput, pieChartMonth) => {
    const monthlyExpenseFilter = (eachExpense) => {
        return eachExpense
            .expenseDate
            .getMonth() === pieChartMonth
            .getMonth();
    }
    return pieChartMonth ? expensesArrayInput.filter(monthlyExpenseFilter) : [...
        expensesArrayInput
    ];
}

export const getExpensesByCategory = (categoriesArray, expensesArray) => {
    return categoriesArray
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
}

export const addColorsToPieChart = (pieChartObject, categoriesArray, globalColors, expenseDataset) => {
    if (pieChartObject) {
        if (pieChartObject.data.datasets) {
            const newColorsArray = [...pieChartObject.data.datasets[0].backgroundColor];
            newColorsArray.push(...randomColor({
                count: categoriesArray.length - newColorsArray.length
            }));
            expenseDataset.backgroundColor = [...newColorsArray];
        } else {
            expenseDataset.backgroundColor = randomColor({
                count: categoriesArray.length
            });
        }
    } else {
        expenseDataset.backgroundColor = randomColor({
            count: categoriesArray.length
        });
    }

    globalColors = [...expenseDataset.backgroundColor];
}

export const pieChartTooltips = {
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

export const pieChartSegmentClick = (categoriesArray, pieChartMonth, clickedExpenses, expenses) => {
    return function (evt, item) {
        if (item.length > 0) {
            const itemIndex = item
                .pop()
                ._index;
            const categoricalFilter = eachExpense => eachExpense.category === categoriesArray[itemIndex] && (
                    pieChartMonth == null ||
                    eachExpense
                    .expenseDate
                    .getMonth() === pieChartMonth
                    .getMonth());
            clickedExpenses = expenses
                .filter(categoricalFilter);
        }
    }
}

export const getDatesForLineChart = (lineChartMonth, expenses) => {
    let expenseDates;
                if (lineChartMonth) {
                    expenseDates = [];
                    let newExpenseDate = new Date(lineChartMonth.getTime());
                    while (lineChartMonth.getMonth() === newExpenseDate.getMonth()) {
                        expenseDates.push(new Date(newExpenseDate.getTime()))
                        newExpenseDate.setDate(newExpenseDate.getDate() + 1);
                    }
                } else {
                    expenseDates = expenses.map(eachExpense => eachExpense.expenseDate);
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
                return getDaysArray(minimumDate, maximumDate);

}