<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col>
                <v-row>
                    <v-col>
                        <span class="text-h4">Eagles (Band) Graph</span>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="d-flex justify-center">
                        <graph-viewer :map="map" :value="results"/>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>

</template>

<script>
    import { mapState } from "vuex";
    import { APP_CONFIG, eventHandler, getAxiosCatchMessage, responseDisplayHelpers } from '../local.js';

    import GraphViewer from '../components/GraphViewer';

    export default {
        mixins: [ responseDisplayHelpers ],
        components: {
            GraphViewer
        },
        data() {
            return {
                map: [
                    { iriPfx: "http://top-songs.com/entity/song", iriShortPfx: "sng", color: "red", textColor: "white", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/album", iriShortPfx: "alb", color: "blue", textColor: "white", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/artist", iriShortPfx: "art", color: "green", textColor: "white", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/label", iriShortPfx: "lbl", color: "yellow", textColor: "black", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/format", iriShortPfx: "fmt", color: "orange", textColor: "black", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/genre", iriShortPfx: "gnr", color: "pink", textColor: "black", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/writer", iriShortPfx: "wtr", color: "violet", textColor: "black", radius: 15 },
                    { iriPfx: "http://top-songs.com/entity/producer", iriShortPfx: "pdr", color: "maroon", textColor: "white", radius: 15 },
                    { iriPfx: "http://top-songs.com/predicate", iriShortPfx: "prd", color: "brown", textColor: "white", radius: 15 }
                ]
            }
        },
        mounted() {
            this.$store.dispatch('graphsSPARQL/setQuery',
                `PREFIX art: <http://top-songs.com/entity/artist#>
                PREFIX p: <http://top-songs.com/predicate#>

                SELECT ?s ?p ?o
                WHERE {
                    {
                        SELECT ?s ?p ?o
                        WHERE {
                            ?s p:writtenBy art:Eagles;
                               ?p ?o .
                        }
                    }
                  
                    UNION
                  
                    {
                        SELECT ?s ?p ?o
                        WHERE {
                            ?songID p:writtenBy art:Eagles;
                                    ?p2 ?s .
                            ?s ?p ?o .
                        }
                    }
                }`
            );

            this.$store.dispatch('graphsSPARQL/clearResults');
            this.$store.dispatch('graphsSPARQL/executeQuery')
                .then((response) => {})
                .catch((error) => { console.log(error); })
                .finally(() => {});
        },
        computed: {
            ...mapState({
                results: state => state.graphsSPARQL.results,
                submissionStatus: state => state.graphsSPARQL.submissionStatus,
                AJAXResponseStatus: state => state.graphsSPARQL.AJAXResponseStatus
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
