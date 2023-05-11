<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col
                v-if="facets.length > 0"
                cols="4"
            >
                <!-- facets -->
                <v-row
                    :class="{ 'mt-n6': chipCount === 0 }"
                >
                    <v-col class="pb-0">
                        <search-facet-chip-viewer @change="setChipCount($event)"/>
                    </v-col>
                </v-row>
                <v-row
                    v-for="facet in facets" :key="'facet-' + facet"
                >
                    <v-col>
                        <search-facet-viewer :name="facet" :display-when-empty="true"/>
                    </v-col>
                </v-row>                
            </v-col>
            <v-col>
                <!-- search and results -->
                <v-row>
                    <v-col>
                        <search-box :type-ahead-suggestions-function="getSuggestions"/>
                    </v-col>
                </v-row>
                <v-row v-if="results.total > 0">
                    <v-col>
                        <search-page-length-setter/>
                    </v-col>
                    <v-col>
                        <search-sort-state/>
                    </v-col>
                    <v-col>
                        <search-page-info/>
                    </v-col>
                </v-row>
                <v-row v-if="results.total > 0">
                    <v-col>
                        <search-results-viewer>
                            <!-- Default slot in case one wants to change the default result rendering -->
                            <!--template v-slot:default="{ item }">
                                <v-row dense>
                                    <v-col>
                                        URI: {{ item.uri }}
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col>
                                        <div
                                            class="divHighlight pl-6"
                                            v-for="(item2, index2) in item.matches" :key="'matches-' + item.uri + '-' + index2"
                                            v-html="JSON.stringify(item2['match-text'], null, 4)"
                                        />
                                    </v-col>
                                </v-row>
                            </template-->
                        </search-results-viewer>
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-col class="d-flex justify-center">
                        No results to show
                    </v-col>
                </v-row>
                <v-row v-if="results.total > 0">
                    <v-col>
                        <search-paginator/>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>

</template>

<script>

    import { mapState } from "vuex";
    import { APP_CONFIG, eventHandler, getAxiosCatchMessage } from '../local.js';

    import SearchBox from "../components/search/SearchBox";
    import SearchFacetChipViewer from "../components/search/SearchFacetChipViewer";
    import SearchFacetViewer from "../components/search/SearchFacetViewer";
    import SearchPageInfo from "../components/search/SearchPageInfo";
    import SearchPageLengthSetter from "../components/search/SearchPageLengthSetter";
    import SearchPaginator from "../components/search/SearchPaginator";
    import SearchResultsViewer from "../components/search/SearchResultsViewer";
    import SearchSortState from "../components/search/SearchSortState";

    export default {
        components: {
            SearchBox,
            SearchFacetChipViewer,
            SearchFacetViewer,
            SearchPageInfo,
            SearchPageLengthSetter,
            SearchPaginator,
            SearchResultsViewer,
            SearchSortState
        },
        data() {
            return {
                chipCount: 0
            }
        },
        mounted() {
        },
        methods: {
            setChipCount(count) {
                this.chipCount = count;
            },
            getSuggestions(qText) {
                return [ Date.now() + ': suggestion 1', Date.now() + ': suggestion 2', Date.now() + ': suggestion 3' ];
            }
        },
        computed: {
            ...mapState({
                results: state => state.search.results,
                submissionStatus: state => state.search.submissionStatus,
                AJAXResponseStatus: state => state.search.AJAXResponseStatus,
                submissionError: state => state.search.submissionError
            }),
            facets() {
                if (this.results.facets) {
                    return Object.keys(this.results.facets);
                } else {
                    return [];
                }
            }
        },
        watch: {
            submissionStatus(value) {
                if (value === 3) {
                    eventHandler.dispatch(
                        'masterSnackBar',
                        {
                            message: getAxiosCatchMessage(this.AJAXResponseStatus),
                            color: 'error',
                            timeout: APP_CONFIG.SNACKBAR_TIMEOUT_LONG
                        }
                    );                                                                     
                }
            }
        }
    }

</script>