<template>
    <div class="columns">
        <div class="column is-three-quarters">
            <b-field v-if="expenses.length > 0" label="Month" label-position="on-border">
                <b-datepicker v-if="expenses.length > 0" v-model="month"
                    v-on:change-month="changeMonth" type="month" icon="calendar-today" trap-focus>
                </b-datepicker>
            </b-field>
        </div>
        <div class="column is-one-quarter">
            <b-button v-on:click="clearMonth">
            <b-icon icon="close" 
            size="is-small" >
            </b-icon>
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "MonthPicker",
    props: ["month", "expenses", "changeMonth", "clearMonth"]
}
</script>