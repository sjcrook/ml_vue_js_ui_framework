<template>

    <v-select
        v-if="display"
        :value="sortState"
        :items="sortList"
        label="Sort"
        outlined
        dense
        @change="setSortState($event)"
    ></v-select>

</template>

<script>

    import { mapState } from "vuex";
    import {  } from '../../local.js';
    
    export default {
        mixins: [],
        data() {
            return {
                sortList: [],
                display: false
            }
        },
        created() {
        },
        mounted() {
            // If not set, get the search options from the modules database.
            if (this.$store.state.search.options === undefined) {
                const that = this;
                this.$store.dispatch('search/getOptions')
                    .then((response) => {
                        that.createSortList();
                    })
                    .catch((error) => { console.log(error); })
                    .finally(() => {});
            } else {
                this.createSortList();
            }
        },
        beforeDestroy() {
        },
        methods: {
            createSortList() {
                const options = this.$store.state.search.options;
                const sortIndex = options.operator.findIndex(item => item.name === 'sort');
                if (sortIndex !== -1) {
                    // If sort options exist in the options node...
                    // Set sortList (the list to be rendered in the dropdown box)
                    this.sortList = options.operator[sortIndex].state.map(item => item.name);
                    if (this.$store.state.search.sortState === undefined) {
                        // Set the sort state in the Vuex persistence layer to the first in the list.
                        this.$store.dispatch('search/setSortState', this.sortList[0]);
                    }
                    this.display = true;
                }
            },
            setSortState(state) {
                // When the user changes the sort value, update the value in the Vuex persistence layer
                this.$store.dispatch('search/setSortState', state);
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                sortState: state => state.search.sortState,
            })
        },
        watch: {
            sortState(value) {
                // When the sort state changes, execute the search
                this.$store.dispatch('search/executeSearch')
                    .then((response) => {})
                    .catch((error) => { console.log(error); })
                    .finally(() => {});
            }
        }
    }

</script>

<style scoped>
</style>