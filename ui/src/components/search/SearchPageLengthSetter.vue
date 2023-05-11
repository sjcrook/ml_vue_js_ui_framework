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
        data() {
            return {
                internalValue: 10,
                pageLengths: [ 5, 10, 15, 20 ]
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
            ...mapState({
                pageLength: state => state.search.pageLength
            })
        },
        watch: {
            pageLength(value) {
                this.internalValue = value;
            },
            internalValue(value) {
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