<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col
                v-if="facets.length > 0"
                cols="4"
            >
                <!-- facets -->
                <!--
                    If there are no chips, move the row up a little so that
                    the top of the first facet card is level with the search box.
                -->
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
                            <!-- Uncomment to override result detail page -->
                            <!--template v-slot:resultDetail="{ item }">
                                <search-result-viewer
                                    class="d-flex justify-end"
                                    :document-uri="item.uri"
                                    :matches="item.matches"
                                >
                                    <template v-slot:default="{ container }">
                                        <v-row>
                                            <v-col>
                                                <div class="font-weight-medium"><span>XXXURI</span>: {{ container.documentUri }}</div>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <div>
                                                    <pre v-if="container.documentType === 'json'" v-html="container.documentDataPrettyJSON"/>
                                                    <pre v-if="container.documentType === 'xml'" v-html="container.documentDataPrettyXML"/>
                                                    <pre v-if="container.documentType === 'txt'" v-html="container.highlightText"/>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </search-result-viewer>
                            </template-->
                            <!-- Uncomment to override result summary card -->
                            <!--template v-slot:resultSummary="{ item }">
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
    import SearchResultViewer from "../components/search/SearchResultViewer";
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
            SearchResultViewer,
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
            // Get  data from Vuex persistence layer
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

<style scoped>
    pre >>> .highlight {
        background-color: yellow;
        font-style: italic;
        font-weight: bold;
    }
</style>