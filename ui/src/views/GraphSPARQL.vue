<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col>
                <v-textarea
                    :value="query"
                    @input="setQuery($event)"
                    label="SPARQL"
                    outlined
                    append-icon="mdi-magnify"
                    clear-icon="mdi-close-circle"   
                    clearable
                    type="text"
                    @click:append="executeQuery()"
                    hide-details
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pb-2">
                <span class="font-weight-bold">Bindings</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pl-8">
                <v-text-field
                    v-model="name"
                    label="Name"
                    outlined
                    hide-details
                ></v-text-field>
            </v-col>
            <v-col>
                <v-select
                    v-model="dataType"
                    :items="dataTypes"
                    label="Data type"
                    outlined
                    hide-details
                ></v-select>
            </v-col>
            <v-col
                v-if="dataType === 'string'"
            >
                <v-select
                    v-model="lang"
                    :items="langs"
                    label="Language"
                    outlined
                    hide-details
                ></v-select>
            </v-col>
            <v-col>
                <v-text-field
                    v-model="value"
                    label="Value"
                    outlined
                    hide-details
                ></v-text-field>
            </v-col>
            <v-row>
                <v-col>
                    <v-btn
                        class="mt-5"
                        icon
                        color="primary"
                        @click="addBinding()"
                    >
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-row>
        <v-row
            v-for="(item, index) in bindingsLocal" :key="'binding-' + index"
        >
            <v-col class="pl-16">
                <span>{{ item.name }} :: {{ item.type }}</span><span v-if="item.type === 'string'"> :: {{ item.lang }}</span><span> :: {{ item.value }}</span>
                <v-btn
                    icon
                    color="primary"
                    @click="removeBinding(item.name)"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="includeSearch"
                    label="Include search constraints"
                    dense
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pb-0">
                <span class="font-weight-bold">Optimization</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pt-0 pl-8">
                <v-radio-group
                    :value="optimize"
                    @change="setOptimize($event)"
                >
                    <v-radio
                        label="Optimize 0"
                        :value="0"
                    ></v-radio>
                    <v-radio
                        label="Optimize 1"
                        :value="1"
                    ></v-radio>
                    <v-radio
                        label="Optimize 2"
                        :value="2"
                    ></v-radio>
                </v-radio-group>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-select
                    v-model="localResponseFormat"
                    :items="responseFormats"
                    label="Response format"
                    outlined
                    hide-details
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <span class="font-weight-bold">Results</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <pre v-html="displayNice(results, responseFormat)"/>
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
                name: null,
                dataType: 'string',
                lang: '',
                value: null,
                dataTypes: [
                    { text: 'String', value: 'string' },
                    { text: 'Integer', value: 'int' },
                    { text: 'Date', value: 'date' }
                ],
                langs: [
                    {  text: '---', value: '' },
                    {  text: 'English', value: 'en' },
                    {  text: 'French', value: 'fr' }
                ],
                includeSearch: false,
                localResponseFormat: null,
                responseFormats: [
                    { text: 'JSON', value: 'application/json' },
                    { text: 'XML', value: 'application/xml'},
                    { text: 'CSV', value: 'text/csv' }
                ]
            }
        },
        mounted() {
            this.localResponseFormat = this.responseFormat;
            if (this.$store.state.graphsSPARQL.query === undefined) {
                this.setQuery('SELECT ?s ?p ?o WHERE { ?s ?p ?o . } LIMIT 10');
            }
        },
        methods: {
            setQuery(value) {
                this.$store.dispatch('graphsSPARQL/setQuery', value);
            },
            addBinding() {
                const binding = { name: this.name, type: this.dataType, lang: this.lang, value: this.value };
                this.$store.dispatch('graphsSPARQL/addBinding', binding);
            },
            removeBinding(name) {
                this.$store.dispatch('graphsSPARQL/removeBinding', name);
            },
            setOptimize(value) {
                this.$store.dispatch('graphsSPARQL/setOptimize', value);
            },
            setResponseFormat(responseFormat) {
                this.$store.dispatch('graphsSPARQL/setResponseFormat', responseFormat);
            },
            executeQuery() {
                if (this.query) {
                    this.$store.dispatch('graphsSPARQL/clearResults');
                    this.$store.dispatch('graphsSPARQL/setResponseFormat', this.localResponseFormat);
                    this.$store.dispatch('graphsSPARQL/executeQuery')
                        .then((response) => {})
                        .catch((error) => { console.log(error); })
                        .finally(() => {});
                }
            }
        },
        computed: {
            ...mapState({
                query: state => state.graphsSPARQL.query,
                bindings: state => state.graphsSPARQL.bindings,
                optimize: state => state.graphsSPARQL.optimize,
                responseFormat: state => state.graphsSPARQL.responseFormat,
                results: state => state.graphsSPARQL.results,
                submissionStatus: state => state.graphsSPARQL.submissionStatus,
                AJAXResponseStatus: state => state.graphsSPARQL.AJAXResponseStatus
            }),
            bindingsLocal() {
                const bindings = [];
                for (const [pName, pObj] of Object.entries(this.bindings)) {
                    bindings.push({ name: pName, ...pObj });
                }
                return bindings;
            }
        },
        watch: {
            includeSearch(value) {
                this.$store.dispatch('graphsSPARQL/setIncludeSearch', value);
            },
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