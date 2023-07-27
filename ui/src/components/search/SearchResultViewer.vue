<template>

    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on"
                icon
            >
                <v-icon>mdi-{{ documentTypeIcon }}</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-toolbar
                dark
                color="primary"
            >
                <v-btn
                    icon
                    dark
                    @click="dialog = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Detail</v-toolbar-title>
            </v-toolbar>
            <slot v-bind:resDetail="container">
                <v-container>
                    <v-row>
                        <v-col>
                            <div class="font-weight-medium"><span>URI</span>: {{ container.documentUri }}</div>
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
                </v-container>
            </slot>
        </v-card>
    </v-dialog>

</template>

<script>

    import { mapState } from "vuex";

    import { responseDisplayHelpers  } from '../../local.js';
    
    export default {
        mixins: [ responseDisplayHelpers ],
        props: {
            documentUri: {
                type: String,
                default: undefined
            },
            matches: {
                type: Array,
                default: () => []
            },
            documentTypeIconOverride: {
                type: String,
                default: undefined
            },
            JsonTransform: {
                type: Function,
                default: null
            },
            XmlTransform: {
                type: Function,
                default: null
            },
            TextTransform: {
                type: Function,
                default: null
            }
        },
        data() {
            return {
                dialog: false,
                documentGetStatus: undefined
            }
        },
        created() {
        },
        mounted() {
        },
        beforeDestroy() {
        },
        methods: {
            documentGet() {
                // Get the document content into the Vuex persistence layer.
                this.$store.dispatch('documentManagement/setDocumentURI', this.documentUri);
                let that = this;
                this.$store.dispatch('documentManagement/documentGet')
                    .then((response) => {
                        that.documentGetStatus = 'got';
                    })
                    .catch((error) => {
                        that.documentGetStatus = undefined;
                        console.log(error);
                    })
                    .finally(() => {});
            },
            highlightJSON(entity = {}, levelsDown = 3, matches = [], replacementString = 'highlight_start$1highlight_end') {  
                function walkTree(entity, levelsDown) {
                    // Walk the JSON object and add highlight placeholder strings around text to be highlighted.
                    if (levelsDown === 0) {
                        return 'pruned';
                    }
                    if (typeof entity === 'object') {
                        if (Array.isArray(entity)) {
                            return entity.map(e => walkTree(e, levelsDown - 1));
                        } else if (entity === null) {
                            return null;
                        } else if (entity.constructor && entity.constructor.name === 'RegExp') {
                            return '"' + String(entity).replace(/(\\|")/g, '\\$1') + '"';
                        } else {
                            const o = {};
                            for (const [key, value] of Object.entries(entity)) {
                              const wTR = walkTree(value, levelsDown - 1);
                              o[key] = wTR;
                            }
                            return o;
                        }
                    } else if (typeof entity === 'function') {
                        return String(entity);
                    } else if (typeof entity === 'string') {
                        if (matches.length > 0) {
                            return entity.replace(re, replacementString);
                        } else {
                          return entity;
                        }
                    } else if (typeof entity === 'undefined') {
                        return undefined;
                    } else {
                        return entity;
                    }
                }
              
                const regExpStr = '(' + matches.join('|') + ')';
                const re = new RegExp(regExpStr, 'g');

                return walkTree(entity, levelsDown);
            },
            highlightXML(node, levelsDown = 3, matches = [], replacementString = 'highlight_start$1highlight_end') {
                // Walk the XML document and add highlight placeholder strings around text to be highlighted.
                if (matches.length > 0) {
                    const regExpStr = '(' + matches.join('|') + ')';
                    const re = new RegExp(regExpStr, 'g');

                    function walk(node) {
                        if (node.nodeType === 3) {
                            // text node
                            node.data = node.nodeValue.replace(re, replacementString);
                        }
                        const children = node.childNodes;
                        for (let i = 0; i < children.length; i++) { // Children are siblings to each other
                            walk(children[i]);
                        }
                    }

                    walk(node);
                }
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                documentData: state => state.documentManagement.documentData,
                submissionStatus: state => state.documentManagement.submissionStatus,
                AJAXResponseStatus: state => state.documentManagement.AJAXResponseStatus,
                submissionError: state => state.documentManagement.submissionError
            }),
            documentType() {
                if (this.documentUri) {
                    const extn = this.documentUri.replace(/.*\./, '');
                    if (extn.length > 0) {
                        return extn;
                    } else {
                        return 'unknown';
                    }
                } else {
                    return 'unknown';
                }
            },
            documentTypeIcon() {
                // Determine which icon to display based on the document type.
                if (this.documentTypeIconOverride) {
                    return this.documentTypeIconOverride;
                } else if (this.documentType === 'json') {
                    return 'code-json';
                } else if (this.documentType === 'xml') {
                    return 'xml';
                } else if (this.documentType === 'txt') {
                    return 'text-box-outline';
                } else {
                    return 'file-document-outline';
                }
            },
            uniqueMatches() {
                // Return a list unique text matches.
                let result = [];
                this.matches.forEach(item => {
                    item['match-text'].forEach(item2 => {
                        if (typeof item2 === 'object') {
                            if (!result.includes(item2.highlight)) {
                                result.push(item2.highlight);
                            }
                        }
                    });
                });
                return result;
            },
            documentDataPrettyJSON() {
                if (this.documentGetStatus === 'got') {
                    const data = this.JsonTransform ? this.JsonTransform(this.documentData) : this.documentData;
                    return JSON.stringify(this.highlightJSON(data, 6, this.uniqueMatches), null, 4).replace(/highlight_start(.*?)highlight_end/g, '<span class="highlight">$1</span>');
                } else {
                    return '{}';
                }
            },
            documentDataPrettyXML() {
                if (this.documentGetStatus === 'got') {
                    // Parse the XML string into a node structure.
                    const doc = (new DOMParser()).parseFromString(this.documentData, "application/xml");
                    const transformedDoc = this.XmlTransform ? this.XmlTransform(doc) : doc;
                    this.highlightXML(transformedDoc, 10, this.uniqueMatches);    
                    const highlightedXMLStr = this.prettifyXML(transformedDoc).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/highlight_start(.*?)highlight_end/g, '<span class="highlight">$1</span>');
                    return highlightedXMLStr;
                } else {
                    return '</>';
                }
            },
            highlightText() {
                if (this.documentGetStatus === 'got') {
                    const newData = this.TextTransform ? this.TextTransform(this.documentData) : this.documentData;
                    const regExpStr = '(' + this.uniqueMatches.join('|') + ')';
                    const re = new RegExp(regExpStr, 'g');
                    return newData.replace(re, '<span class="highlight">$1</span>');
                } else {
                    return '';
                }
            },
            container() {
                return {
                    documentUri: this.documentUri,
                    documentType: this.documentType,
                    documentGetStatus: this.documentGetStatus,
                    documentData: this.documentData,
                    uniqueMatches: this.uniqueMatches,
                    highlightJSON: this.highlightJSON,
                    highlightXML: this.highlightXML,
                    documentDataPrettyJSON: this.documentType === 'json' ? this.documentDataPrettyJSON : null,
                    documentDataPrettyXML: this.documentType === 'xml' ? this.documentDataPrettyXML : null,
                    highlightText: this.documentType === 'txt' ? this.highlightText : null
                };
            }
        },
        watch: {
            documentUri(value) {
                this.documentGetStatus = 'URISet';
            },
            dialog(value) {
                if (value) {
                    this.documentGet();
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