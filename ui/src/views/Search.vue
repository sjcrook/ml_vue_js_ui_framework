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
                            <!--template v-slot:resDetail="{ item }">
                                <search-result-viewer
                                    class="d-flex justify-end"
                                    :document-uri="item.uri"
                                    :matches="item.matches"
                                >
                                    <template v-slot:default="{ resDetail }">
                                        <v-container>
                                            <v-row>
                                                <v-col>
                                                    <div class="font-weight-medium"><span>XURI</span>: {{ resDetail.documentUri }}</div>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <div v-html="displayData(resDetail)"></div>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </template>
                                </search-result-viewer>
                            </template-->
                            <!--template v-slot:default="{ resMeta }">
                                <v-card class="pa-4 mb-4">
                                    <v-container>
                                        <v-row dense>
                                            <v-col class="d-flex justify-end">
                                                <search-result-viewer
                                                    class="d-flex justify-end"
                                                    :document-uri="resMeta.item.uri"
                                                    :matches="resMeta.item.matches"
                                                >
                                                    <template v-slot:default="{ resDetail }">
                                                        <v-container>
                                                            <v-row>
                                                                <v-col>
                                                                    <div class="font-weight-medium"><span>URI</span>: {{ resDetail.documentUri }}</div>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <div>
                                                                        <pre v-if="resDetail.documentType === 'json'" v-html="resDetail.documentDataPrettyJSON"/>
                                                                        <pre v-if="resDetail.documentType === 'xml'" v-html="resDetail.documentDataPrettyXML"/>
                                                                        <pre v-if="resDetail.documentType === 'txt'" v-html="resDetail.highlightText"/>
                                                                    </div>
                                                                </v-col>
                                                            </v-row>
                                                        </v-container>
                                                    </template>
                                                </search-result-viewer>
                                            </v-col>
                                        </v-row>
                                        <v-row dense>
                                            <v-col>
                                                {{ resMeta.item.uri }}
                                            </v-col>
                                        </v-row>
                                        <v-row dense>
                                            <v-col>
                                                <div
                                                    class="divHighlight pl-6"
                                                    v-for="(item2, index2) in resMeta.item.matches" :key="'matches-' + resMeta.index + '-' + index2"
                                                    v-html="JSON.stringify(item2['match-text'], null, 4)"
                                                />
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card>
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
                chipCount: 0,
                vHTMLData: null
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
            },
            formatCreatedAtDateTime(dt) {
                return (new Date(dt)).toLocaleString();
            },
            jsonTransform(data) {
                return {
                    url: data.url,
                    id: data.id,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    type: data.type,
                    subject: data.subject,
                    description: data.description,
                    priority: data.priority,
                    status: data.status,
                    requester: {
                        name: data.requester.name,
                        email: data.requester.email,
                        phone: data.requester.phone
                    },
                    assignee: {
                        name: data.assignee.name,
                        email: data.assignee.email
                    },
                    comments: data.comments.map(comment => { return { type: comment.type, author_name: comment.author_name, html_body: comment.html_body } })
                };
            },
            jsonToHTML(json, indent = 0) {
                const arr = [];
                for (const p in json) {
                    if (typeof json[p] === 'object') {
                        arr.push(`<div class=\"ml-${indent*4}\"><span style=\"font-weight: bold\">${p}</span>` + this.jsonToHTML(json[p], indent + 1) + `</div>`);
                    } else {
                        if (p === 'html_body') {
                            arr.push(`<div class=\"ml-${indent*4}\"><span style=\"font-weight: bold\">${p}</span>: <div class=\"ml-${indent*5}\">${json[p]}</div></div>`);
                        } else {
                            arr.push(`<div class=\"ml-${indent*4}\"><span style=\"font-weight: bold\">${p}</span>: ${json[p]}</div>`);
                        }
                    }
                }
                let result;
                if (indent === 0) {
                    result = `<div>` + arr.join('') + `</div>`;
                } else {
                    result = arr.join('');
                }
                return result;
            },
            displayData(container) {
                if (container.documentGetStatus === 'got') {
                    const data = container.highlightJSON(this.jsonTransform(container.documentData), 6, container.uniqueMatches);
                    return this.jsonToHTML(data).replace(/highlight_start(.*?)highlight_end/g, '<span class="highlight">$1</span>');
                } else {
                    return 'Waiting for data';
                }
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
    div >>> .highlight {
        background-color: yellow;
        font-style: italic;
        font-weight: bold;
    }
</style>