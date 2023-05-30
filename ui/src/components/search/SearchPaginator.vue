<template>

    <v-container>
        <v-row>
            <v-col class="text-center">
                <span
                    v-for="(item, index) in internalPageDetails" :key="'sp-' + index"
                >
                    <!-- Either render a paginator icon or the page number -->
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
            // Copy the search results data to an internal representation, internalPageDetails
            this.copyResultsToInternal();
        },
        beforeDestroy() {
        },
        methods: {
            copyResultsToInternal() {
                /*
                    Create the internal representation, internalPageDetails (an array), that
                    will be used to to render the paginator on the screen.
                */
                this.internalPageDetails = [];
                if (this.results.total > 0) {
                    const total = this.results.total;
                    const start = this.results.start;
                    const pageLength = this.results['page-length'];
                    const currentPage = (start + pageLength - 1)/pageLength;
                    const totalPages = Math.ceil(total/pageLength);
                    const maxPageStart = totalPages * pageLength - pageLength + 1;
                    /*
                        Set hte min and max page numbers to display based on total number of
                        page to display (APP_CONFIG.MAX_ENUMERATED_PAGES)
                    */
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
                            // Add the start icons
                            this.internalPageDetails.push({ value: 'mdi-skip-previous-outline', start: 1 });
                            this.internalPageDetails.push({ value: 'mdi-chevron-double-left', start: Math.max(1, start - pageLength * APP_CONFIG.MAX_ENUMERATED_PAGES) });
                            this.internalPageDetails.push({ value: 'mdi-chevron-left', start: (start - pageLength) });
                        }

                        // Add the page numbers
                        for (let p = minPage; p <= maxPage; p++) {
                            this.internalPageDetails.push({ value: p, start: (p * pageLength - pageLength + 1), current: p === currentPage });
                        }

                        if (currentPage < totalPages) {
                            // Add the end icons
                            this.internalPageDetails.push({ value: 'mdi-chevron-right', start: (start + pageLength) });
                            this.internalPageDetails.push({ value: 'mdi-chevron-double-right', start: Math.min(maxPageStart, start + pageLength * APP_CONFIG.MAX_ENUMERATED_PAGES) });
                            this.internalPageDetails.push({ value: 'mdi-skip-next-outline', start: maxPageStart });
                        }
                    }
                }
            },
            updateStart(start) {
                // Set/update the page start value in the Vuex persistence layer
                this.$store.dispatch('search/setStart', start);
            },
            getLabel(mdi) {
                //  Determine which tooltip to return.
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
                    // When the search results change, update the internal representation.
                    this.copyResultsToInternal();
                }
            },
            start(value) {
                // When start changes, execute the search
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