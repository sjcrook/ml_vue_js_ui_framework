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
                    this.sortList = options.operator[sortIndex].state.map(item => item.name);
                    if (this.$store.state.search.sortState === undefined) {
                        this.$store.dispatch('search/setSortState', this.sortList[0]);
                    }
                    this.display = true;
                }
            },
            setSortState(state) {
                this.$store.dispatch('search/setSortState', state);
            }
        },
        computed: {
            ...mapState({
                sortState: state => state.search.sortState,
            })
        },
        watch: {
            sortState(value) {
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