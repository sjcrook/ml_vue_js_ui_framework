<template>

    <v-select
        v-model="internalValue"
        :items="pageLengths"
        label="Page Length"
        outlined
        dense
    ></v-select>

</template>

<script>

    import { mapState } from "vuex";
    import { } from '../../local.js';
    
    export default {
        mixins: [],
        props: {
            pageLengths: {
                type: Array,
                default: () => [ 5, 10, 15, 20 ]
            }
        },
        data() {
            return {
                internalValue: 10,
            }
        },
        created() {
        },
        mounted() {
            this.internalValue = this.pageLength;
        },
        beforeDestroy() {
        },
        methods: {
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                pageLength: state => state.search.pageLength
            })
        },
        watch: {
            pageLength(value) {
                this.internalValue = value;
            },
            internalValue(value) {
                /* When internalValue changes (via user input), set the value in the Vuex 
                   persistence layer and execute the search
                */
                this.$store.dispatch('search/setPageLength', value);
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