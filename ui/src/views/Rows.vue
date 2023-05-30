<template>

    <v-container fluid class="my-5">
        <v-row>
            <v-col>
                <v-textarea
                    :value="payload"
                    @input="setPayload($event)"
                    label="Payload"
                    outlined
                    append-icon="mdi-magnify"
                    clear-icon="mdi-close-circle"   
                    clearable
                    type="text"
                    @click:append="execute()"
                    hide-details
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pb-0">
                <span class="font-weight-bold">Payload Type</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pt-0 pl-8">
                <v-radio-group
                    :value="payloadType"
                    @change="setPayloadType($event)"
                >
                    <v-radio
                        label="Javascript Query"
                        value="js"
                    ></v-radio>
                    <v-radio
                        label="Plan"
                        value="json"
                    ></v-radio>
                </v-radio-group>
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
            <v-col>
                <v-checkbox
                    v-if="localResponseFormat === 'application/json'"
                    class="mt-2"
                    v-model="displayAsTable"
                    label="Display as table"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pb-0">
                <span class="font-weight-bold">Results</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-simple-table
                    v-if="results && localResponseFormat === 'application/json' && displayAsTable"
                >
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th
                                    v-for="(item, index) in results.columns" :key="'th-' + index"
                                    class="text-left"
                                >
                                    {{ item.name }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(row, index) in results.rows" :key="'tr-' + index"
                              >
                                <td
                                    v-for="keyValue in row"
                                >
                                    {{ keyValue.value }}
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
                <pre
                    v-else
                    v-html="displayNice(results, responseFormat)"
                />
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
                localResponseFormat: null,
                responseFormats: [
                    { text: 'JSON', value: 'application/json' },
                    { text: 'XML', value: 'application/xml'},
                    { text: 'CSV', value: 'text/csv' }
                ],
                displayAsTable: false
            }
        },
        mounted() {
            this.localResponseFormat = this.responseFormat;
            if (this.$store.state.rows.payload === undefined) {
                console.log('payload', this.$store.state.rows);
                this.name = 'artistparam';
                this.value = 'Eagles';
                this.addBinding();
                this.$store.dispatch('rows/setPayload',
                    [
                        'op.fromSPARQL("',
                        '    SELECT ?songTitle ?artistName',
                        '    WHERE {',
                        '        ?songID <http://top-songs.com/predicate#hasSongTitle> ?songTitle;',
                        '                <http://top-songs.com/predicate#writtenBy> ?artistID .',
                        '        ?artistID <http://top-songs.com/predicate#hasArtistName> ?artistName;',
                        '                  <http://top-songs.com/predicate#hasArtistName> ?artistparam .',
                        '    }',
                        '    LIMIT 10',
                        '")'
                    ].join('\n')
                );
            }
        },
        methods: {
            setPayload(value) {
                this.$store.dispatch('rows/setPayload', value);
            },
            setPayloadType(value) {
                this.$store.dispatch('rows/setPayloadType', value);
            },
            addBinding() {
                const binding = { name: this.name, type: this.dataType, lang: this.lang, value: this.value };
                this.$store.dispatch('rows/addBinding', binding);
            },
            removeBinding(name) {
                this.$store.dispatch('rows/removeBinding', name);
            },
            setOptimize(value) {
                this.$store.dispatch('rows/setOptimize', value);
            },
            setResponseFormat(responseFormat) {
                this.$store.dispatch('rows/setResponseFormat', responseFormat);
            },
            execute() {
                this.$store.dispatch('rows/clearResults');
                this.$store.dispatch('rows/setResponseFormat', this.localResponseFormat);
                this.$store.dispatch('rows/execute')
                    .then((response) => {})
                    .catch((error) => { console.log(error); })
                    .finally(() => {});
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                payload: state => state.rows.payload,
                payloadType: state => state.rows.payloadType,
                bindings: state => state.rows.bindings,
                optimize: state => state.rows.optimize,
                responseFormat: state => state.rows.responseFormat,
                results: state => state.rows.results,
                submissionStatus: state => state.rows.submissionStatus,
                AJAXResponseStatus: state => state.rows.AJAXResponseStatus
            }),
            bindingsLocal() {
                // Convert bindings object to an array of bindings used in the rendering.
                const bindings = [];
                for (const [pName, pObj] of Object.entries(this.bindings)) {
                    bindings.push({ name: pName, ...pObj });
                }
                return bindings;
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