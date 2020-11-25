<template>
    <section>
        <b-field label="Expense title" :label-position="labelPosition">
            <b-input v-model="title"></b-input>
        </b-field>
        <!-- <b-field label="Currency" :label-position="labelPosition">
            <b-autocomplete v-model="currency" :open-on-focus="openOnFocus" :data="filteredCurrencyObj"
                :clearable="true" @select="option => (selected = option)">
            </b-autocomplete>
        </b-field> -->
        <b-field label="Category" :label-position="labelPosition">
            <b-autocomplete v-model="category" :open-on-focus="openOnFocus" :data="filteredCategoryObj"
                :clearable="true" @select="option => (selected = option)">
            </b-autocomplete>
        </b-field>
        <b-field label="Amount" :label-position="labelPosition">
            <b-numberinput v-model="amountValue" :step="0.01" :min="0.01">
            </b-numberinput>
        </b-field>
        <b-field label="Expense date" :label-position="labelPosition">
            <b-datepicker
                v-model="expenseDate"
                :show-week-number="true"
                icon="calendar-today"
                trap-focus>
            </b-datepicker>
        </b-field>
        <b-button @click="addExpense" :disabled="buttonDisabled()">Add expense</b-button>
    </section>

</template>

<script>
    // import {currencyCodes} from '../assets/currencies';
    import {expenseCategories} from '../assets/expenseCategories';

    export default {
        name: 'AddExpense',
        data() {
            return {
                labelPosition: 'on-border',
                amountValue: 0,
                // currencyCodes,
                openOnFocus: true,
                currency: 'SGD',
                category: 'Food',
                title: '',
                expenseDate: new Date()
            }
        },
        methods: {
            addExpense() {
                this.$emit('add-expense', {
                    currency: this.currency,
                    category: this.category,
                    title: this.title,
                    expenseDate: this.expenseDate,
                    amountValue: this.amountValue
                });
                this.$buefy.notification.open('Expense added :)');
                this.currency = 'SGD';
                this.category = 'Food';
                this.title = '';
                this.expenseDate = new Date();
                this.amountValue = 0;
            },
            buttonDisabled() {
                if (this.title != '' && this.amountValue != 0) {
                    return false;
                }
                return true;
            }
        },
        computed: {
            // filteredCurrencyObj() {
            //     return currencyCodes.filter(option => {
            //         return (
            //             option
            //             .toLowerCase()
            //             .indexOf(this.currency.toLowerCase()) >= 0
            //         )
            //     });
            // },
            filteredCategoryObj() {
                return expenseCategories.filter(option => {
                    return (
                        option
                        .toLowerCase()
                        .indexOf(this.category.toLowerCase()) >= 0
                    )
                });
            }
        }

    }
</script>