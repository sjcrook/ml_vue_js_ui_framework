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
            <v-container>
                <v-row>
                    <v-col>
                        <div class="font-weight-medium"><span>URI</span>: {{ documentUri }}</div>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <div>
                            <pre v-if="documentType === 'json'" v-html="documentDataPrettyJSON"/>
                            <pre v-if="documentType === 'xml'" v-html="documentDataPrettyXML"/>
                            <pre v-if="documentType === 'txt'" v-html="highlightText"/>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
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
            ...mapState({
                documentData: state => state.documentManagement.documentData,
                submissionStatus: state => state.documentManagement.submissionStatus,
                AJAXResponseStatus: state => state.documentManagement.AJAXResponseStatus,
                submissionError: state => state.documentManagement.submissionError
            }),
            documentType() {
                if (this.documentUri) {
                    return this.documentUri.replace(/.*\./, '');
                } else {
                    return 'unknown';
                }
            },
            documentTypeIcon() {
                if (this.documentType === 'json') {
                    return 'code-json';
                } else if (this.documentType === 'xml') {
                    return 'xml';
                } else if (this.documentType === 'txt') {
                    return 'text-box-outline';
                } else {
                    return 'file-document-outline';
                }
            },
            documentDataPrettyJSON() {
                if (this.documentGetStatus === 'got') {
                    return JSON.stringify(this.highlightJSON(this.documentData, 6, this.uniqueMatches), null, 4).replace(/highlight_start/g, '<span class="highlight">').replace(/highlight_end/g, '</span>');
                } else {
                    return '{}';
                }
            },
            documentDataPrettyXML() {
                if (this.documentGetStatus === 'got') {
                    const doc = (new DOMParser()).parseFromString(this.documentData, "application/xml");
                    this.highlightXML(doc, 10, this.uniqueMatches);    
                    const highlightedXMLStr = this.prettifyXML(doc).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/highlight_start/g, '<span class="highlight">').replace(/highlight_end/g, '</span>');
                    return highlightedXMLStr;
                } else {
                    return '</>';
                }
            },
            highlightText() {
                const regExpStr = '(' + this.uniqueMatches.join('|') + ')';
                const re = new RegExp(regExpStr, 'g');
                return this.documentData.replace(re, '<span class="highlight">$1</span>');
            },
            uniqueMatches() {
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