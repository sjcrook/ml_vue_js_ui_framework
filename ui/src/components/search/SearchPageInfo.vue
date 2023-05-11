<template>

    <div :class="alignment">
        <span
            v-if="results.total > 0"
        >
            {{ results.start }} to {{ Math.min(results.start + results['page-length'] - 1, results.total) }} of {{ results.total }}
        </span>
        <span
            v-else
        >
            No records match your search criteria
        </span>
    </div>

</template>

<script>

    import { mapState } from "vuex";
    import {  } from '../../local.js';
    
    export default {
        data() {
            return {
            }
        },
        created() {
        },
        mounted() {
        },
        beforeDestroy() {
        },
        methods: {
        },
        computed: {
            ...mapState({
                results: state => state.search.results
            }),
            alignment() {
                if (this.results.total > 0) {
                    return 'text-right';
                } else {
                    return 'text-center';
                }
            }
        },
        watch: {
        }
    }

</script>

<style scoped>
</style>