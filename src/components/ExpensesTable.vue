<template>
    <b-table default-sort="expenseDate" v-if="expenses.length > 0" :show-detail-icon="false" per-page="10" detailed
        pagination-rounded :data="expenses" v-on:cellclick="deleteExpense" paginated>
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
        <b-table-column label="Amount (S$)" field="amountValue" sortable v-slot="props">
            <div style="text-align: right"><span>
                    {{new Intl.NumberFormat('en-US').format(props.row.amountValue)}}
                </span></div>
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
</template>

<script>
export default {
    name: "ExpensesTable",
    props: ["expenses", "deleteExpense"]
}
</script>