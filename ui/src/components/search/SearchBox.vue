<template>

    <div>
        <v-text-field
            v-model="qTextInternal"
            outlined
            hide-details
            label="Search"
            append-icon="mdi-magnify"
            clear-icon="mdi-close-circle"
            clearable
            type="text"
            @click:append="updateQText()"
            @click:clear="clearAndUpdate()"
            @keydown.enter="updateQText()"
            @keydown.up="keyUp()"
            @keydown.down="keyDown()"
            @keydown.tab="keyTab()"
        ></v-text-field>

        <v-card
            v-if="typeAheadSuggestions.length > 0"
            max-width="400"
        >
            <v-list dense>
                <v-list-item-group
                    v-model="selectedSuggestionIndex"
                    color="primary"
                >
                    <v-list-item
                        v-for="(item, index) in typeAheadSuggestions" :key="'typeAheadSuggestion-' + index"
                    > 
                        <v-list-item-content>
                            <v-list-item-title>{{item}}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>

        </v-card>
    </div>
  

</template>

<script>

    import { mapState } from "vuex";
    import { } from '../../local.js';

    export default {
        mixins: [],
        props: {
            typeAheadSuggestionsFunction: {
                type: Function,
                default: undefined //() => {}
            }
        },
        data() {
            return {
                qTextInternal: '',
                typeAheadSuggestions: [],
                selectedSuggestionIndex: -1,
                blockSuggestionRefresh: false,
                setInternally: false,
                setExternally: false
            }
        },
        mounted() {
            this.blockSuggestionRefresh = true;
            this.qTextInternal = this.qText;
        },
        methods: {
            updateQText() {
                this.$store.dispatch('search/setQText', this.qTextInternal === null ? '' : this.qTextInternal);
                this.typeAheadSuggestions = [];
                this.selectedSuggestionIndex = -1;                
            },
            clearAndUpdate() {
                this.blockSuggestionRefresh = true;
                //this.qTextInternal = '';
                this.updateQText();
            },
            keyUp() {
                if (this.selectedSuggestionIndex === -1) {
                    this.selectedSuggestionIndex = this.typeAheadSuggestions.length - 1;
                } else {
                    this.selectedSuggestionIndex = (this.selectedSuggestionIndex + this.typeAheadSuggestions.length - 1) % this.typeAheadSuggestions.length;
                }
            },
            keyDown() {
                this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % this.typeAheadSuggestions.length;
            },
            keyTab() {
                if (this.selectedSuggestionIndex !== -1) {
                    this.blockSuggestionRefresh = true;
                    this.qTextInternal = this.typeAheadSuggestions[this.selectedSuggestionIndex];
                    this.typeAheadSuggestions = [];
                    this.selectedSuggestionIndex = -1;
                }
            }
        },
        computed: {
            ...mapState({
                qText: state => state.search.qText
            })
        },
        watch: {
            qText(value) {
                if (!this.setInternally) {
                    this.qTextInternal = value;
                    this.setExternally = true;
                } else {
                    this.setInternally = false;
                    this.$store.dispatch('search/executeSearch')
                        .then((response) => {})
                        .catch((error) => { console.log(error); })
                        .finally(() => {});
                }                
            },
            qTextInternal(value) {
                if (!this.setExternally) {
                    if (this.blockSuggestionRefresh) {
                        this.blockSuggestionRefresh = false;
                    } else {
                        if (this.typeAheadSuggestionsFunction !== undefined) {
                            this.typeAheadSuggestions = this.typeAheadSuggestionsFunction(value);
                            this.selectedSuggestionIndex = -1;
                        }
                    }
                    this.setInternally = true;
                } else {
                    this.setExternally = false;
                }
            }
        }
    }

</script>

<style scoped>
</style>