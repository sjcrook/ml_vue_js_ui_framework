<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col>
                <v-textarea
                    :value="query"
                    @input="setQuery($event)"
                    label="graphQL Query"
                    outlined
                    append-icon="mdi-magnify"
                    clear-icon="mdi-close-circle"   
                    clearable
                    type="text"
                    @click:append="executeQuery()"
                    hide-details
                    rows="14"
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <span class="font-weight-bold">Results</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <pre v-html="displayNice(results, 'application/json')"/>
            </v-col>
        </v-row>
    </v-container>

    </div>

</template>

<script>

    import { mapState } from "vuex";
    import { APP_CONFIG, eventHandler, getAxiosCatchMessage, responseDisplayHelpers } from '../local.js';

    export default {
        mixins: [ responseDisplayHelpers ],
        components: {
        },
        data() {
            return {
            }
        },
        mounted() {
            //this.setQuery('SELECT ?s ?p ?o WHERE { ?s ?p ?o . } LIMIT 10');
            if (this.$store.state.graphQL.query === undefined) {
                this.setQuery(
                    [
                        'query topSongsQuery {',
                        '    CompleteSong(first: 10, offset: 0) @Sort(field:artist, direction: Descending) {',
                        '        title',
                        '        artist',
                        '        album', 
                        '        label', 
                        '        weeks { week }',
                        '        formats { format }',
                        '        genres { genre }',
                        '        writers { writer }',
                        '        producers { producer }',
                        '    }',
                        '}'
                    ].join('\n')
                );
            }
        },
        methods: {
            setQuery(value) {
                this.$store.dispatch('graphQL/setQuery', value);
            },
            executeQuery() {
                if (this.query) {
                    this.$store.dispatch('graphQL/clearResults');
                    this.$store.dispatch('graphQL/executeQuery')
                        .then((response) => {})
                        .catch((error) => { console.log(error); })
                        .finally(() => {});
                }
            }
        },
        computed: {
            ...mapState({
                query: state => state.graphQL.query,
                results: state => state.graphQL.results,
                submissionStatus: state => state.graphQL.submissionStatus,
                AJAXResponseStatus: state => state.graphQL.AJAXResponseStatus
            })
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