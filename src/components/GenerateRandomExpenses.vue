<template>
    <section style="padding-left: 5%">


        <b-button type="is-dark" @click="isComponentModalActive = true">Generate random expenses</b-button>

        <b-modal v-model="isComponentModalActive" has-modal-card trap-focus :destroy-on-hide="false" aria-role="dialog"
            aria-modal>
            <div class="modal-card" style="width: auto" >
                <header class="modal-card-head">
                    <p class="modal-card-title">Random expense generator</p>
                </header>
                <section class="modal-card-body">
                    <ul>
                        <b-field label="Number of expenses">
                            <b-numberinput v-model="number" :step="1" :min="1"></b-numberinput>
                        </b-field>
                        <b-field label="Expense date range">
                            <b-datepicker placeholder="Click to select..." inline v-model="dates" range></b-datepicker>
                        </b-field>
                        <b-field label="Expense amount range">
                            <b-slider v-model="numbers" :min="0" :max="10000" :step="10" ticks></b-slider>
                        </b-field>
                    </ul>
                </section>
                <footer class="modal-card-foot">
                    <b-button :disabled="isGeneratorDisabled()" type="is-dark" @click="generateRandomExpenses">Generate
                    </b-button>
                </footer>
            </div>
        </b-modal>
    </section>
</template>

<script>
    import moment from 'moment';
    // import {currencyCodes} from '../assets/currencies';
    import {
        format
    } from 'date-fns';
    import {
        expenseCategories
    } from '../assets/expenseCategories';
    import {
        v4 as uuid
    } from 'uuid';
    import randomWords from 'random-words';
    export default {
        name: 'GenerateRandomExpenses',
        data() {
            return {
                isComponentModalActive: false,
                numbers: [
                    0, 10000
                ],
                number: 1,
                dates: [],
                randomExpenses: [],
                isImageModalActive: false,
                isCardModalActive: false
            }
        },
        methods: {
            isGeneratorDisabled() {
                if (this.dates.length != 2) {
                    return true;
                }
            },
            getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            },
            generateRandomExpenses() {
                this.isComponentModalActive = false;
                let counter = 0;
                const dateDiff = moment(this.dates[1]).diff(moment(this.dates[0]), 'days');
                const amountDiff = this.numbers[1] - this.numbers[0];
                // const currencyCodeLength = currencyCodes.length;
                const expenseCategoriesLength = expenseCategories.length;
                while (counter < this.number) {
                    let randomDate = moment(this.dates[0]).add(this.getRandomInt(dateDiff), 'days')
                                .toDate();
                    counter++;
                    this
                        .randomExpenses
                        .push({
                            currency: "SGD",
                            // currencyCodes[this.getRandomInt(currencyCodeLength)],
                            category: expenseCategories[this.getRandomInt(expenseCategoriesLength)],
                            title: randomWords(),
                            id: uuid(),
                            expenseDate: randomDate,
                            expenseDateString: format(randomDate, 'yyyy-MM-dd'),
                            amountValue: this.numbers[0] + this.getRandomInt(amountDiff)
                        });
                }
                this.$emit('add-random-expenses', this.randomExpenses)
                // console.log(this.randomExpenses);
            }
        }
    }
</script>