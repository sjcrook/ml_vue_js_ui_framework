<template>

    <v-container>
        <v-row>
            <v-col class="text-center">
                <span
                    v-for="(item, index) in internalPageDetails" :key="'sp-' + index"
                >
                    <v-tooltip
                        v-if="typeof item.value === 'string'"
                        bottom
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                text
                                color="secondary"
                                @click="updateStart(item.start)"
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon>{{ item.value }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ getLabel(item.value) }}</span>
                    </v-tooltip>
                    <v-btn
                        v-else
                        text
                        :color="item.current ? 'primary' : 'secondary'"
                        :disabled="item.current"
                        @click="updateStart(item.start)"
                    >
                        {{ item.value }}
                    </v-btn>
                </span>
            </v-col>
        </v-row>
    </v-container>

</template>

<script>

    import { mapState } from "vuex";
    import { APP_CONFIG } from '../../local.js';
    
    export default {
        mixins: [],
        data() {
            return {
                internalPageDetails: []
            }
        },
        created() {
        },
        mounted() {
            this.copyResultsToInternal();
        },
        beforeDestroy() {
        },
        methods: {
            copyResultsToInternal() {
                this.internalPageDetails = [];
                if (this.results.total > 0) {
                    const total = this.results.total;
                    const start = this.results.start;
                    const pageLength = this.results['page-length'];
                    const currentPage = (start + pageLength - 1)/pageLength;
                    const totalPages = Math.ceil(total/pageLength);
                    const maxPageStart = totalPages * pageLength - pageLength + 1;
                    const minPage = Math.min(
                        Math.max(1, currentPage - (APP_CONFIG.MAX_ENUMERATED_PAGES - 1)/2), // handles bottom end
                        Math.max(1, totalPages - APP_CONFIG.MAX_ENUMERATED_PAGES + 1) // handles top end
                    );
                    const maxPage = Math.max(
                        Math.min(totalPages, currentPage + (APP_CONFIG.MAX_ENUMERATED_PAGES - 1)/2), // handles top end
                        Math.min(totalPages, APP_CONFIG.MAX_ENUMERATED_PAGES) // handles bottom end
                    );

                    if (total > pageLength) {
                        if (currentPage > 1) {
                            this.internalPageDetails.push({ value: 'mdi-skip-previous-outline', start: 1 });
                            this.internalPageDetails.push({ value: 'mdi-chevron-double-left', start: Math.max(1, start - pageLength * APP_CONFIG.MAX_ENUMERATED_PAGES) });
                            this.internalPageDetails.push({ value: 'mdi-chevron-left', start: (start - pageLength) });
                        }

                        for (let p = minPage; p <= maxPage; p++) {
                            this.internalPageDetails.push({ value: p, start: (p * pageLength - pageLength + 1), current: p === currentPage });
                        }

                        if (currentPage < totalPages) {
                            this.internalPageDetails.push({ value: 'mdi-chevron-right', start: (start + pageLength) });
                            this.internalPageDetails.push({ value: 'mdi-chevron-double-right', start: Math.min(maxPageStart, start + pageLength * APP_CONFIG.MAX_ENUMERATED_PAGES) });
                            this.internalPageDetails.push({ value: 'mdi-skip-next-outline', start: maxPageStart });
                        }
                    }
                }
            },
            updateStart(start) {
                this.$store.dispatch('search/setStart', start);
            },
            getLabel(mdi) {
                switch (mdi) {
                    case 'mdi-skip-previous-outline': return 'first page';
                    case 'mdi-chevron-double-left': return 'previous set of pages';
                    case 'mdi-chevron-left': return 'previous page';
                    case 'mdi-chevron-right': return 'next page';
                    case 'mdi-chevron-double-right': return 'next set of pages';
                    case 'mdi-skip-next-outline': return 'last page';
                }
            }
        },
        computed: {
            ...mapState({
                start: state => state.search.start,
                results: state => state.search.results
            })
        },
        watch: {
            results: {
                deep: true,
                handler(value) {
                    this.copyResultsToInternal();
                }
            },
            start(value) {
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