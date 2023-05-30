<template>

    <div
        v-if="results.total > 0"
    >
        <v-card
            v-for="(item, index) in results.results" :key="'results-' + index"
            class="pa-4 mb-4"
        >
            <v-container>
                <v-row dense>
                    <v-col class="d-flex justify-end">
                        <slot name="resultDetail" v-bind:item="item">
                            <!-- Render result detail -->
                            <search-result-viewer
                                class="d-flex justify-end"
                                :document-uri="item.uri"
                                :matches="item.matches"
                            />
                        </slot>
                    </v-col>
                </v-row>
                <slot name="resultSummary" v-bind:item="item">
                    <v-row dense>
                        <v-col>
                            {{ niceDocumentURI(item.uri) }}
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <div
                                class="divHighlight pl-6"
                                v-for="(item2, index2) in item.matches" :key="'matches-' + index + '-' + index2"
                                v-html="matchText(item2['match-text'])"
                            />
                        </v-col>
                    </v-row>
                </slot>
            </v-container>
        </v-card>
    </div>

</template>

<script>

    import { mapState } from "vuex";
    import {  } from '../../local.js';

    import SearchResultViewer from "./SearchResultViewer";

    const MAX_URI_STARTER_LENGTH = 20;
    
    export default {
        components: {
            SearchResultViewer
        },
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
            niceDocumentURI(uri) {
                return uri.substr(0, MAX_URI_STARTER_LENGTH) + '.../' + uri.replace(/.*\//, '');
            },
            matchText(matchTextArr) {
                // Convert the match-text array into a string with highlighted text
                let result = '';
                matchTextArr.forEach(item => {
                    if (typeof item === 'string') {
                        result += item;
                    } else {
                        result += '<span class="primary--text spanHighlight">' + item.highlight + '</span>';
                    }
                });
                if (!result.startsWith('...')) {
                    result = '...' + result;
                }
                if (!result.endsWith('...')) {
                    result += '...';
                }
                return result;
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                results: state => state.search.results
            })
        },
        watch: {
        }
    }

</script>

<style scoped>
    .divHighlight >>> .spanHighlight {
         font-style: italic;
         font-weight: bold;
    }
</style>