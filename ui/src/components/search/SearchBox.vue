<template>

    <div>
        <v-text-field
            ref="searchbox"
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
            @keydown.tab="keyTab($event)"
        ></v-text-field>

        <!-- A v-card to show type-ahead suggestions underneath the search box -->
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
                        @click="typeAheadSuggestionsClick($event, index)"
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
                /*

                    The following two flags determine whether a change occurred
                    inside or outside a component so as to prevent infinite update loops.
                */
                setInternally: false,
                setExternally: false
            }
        },
        mounted() {
            /*
                Type-ahead suggestions are only to be refreshed when the user types
                into the search box.  Otherwise, block the refresh.
            */
            this.blockSuggestionRefresh = true;
            // Get the qText from the Vuex persistence layer
            this.qTextInternal = this.qText;
        },
        methods: {
            updateQText() {
                /*
                    Upon each keypress, clear the type-ahead suggestions, reset the type-ahead selectedSuggestionIndex
                    and set the qText in the Vuex persistence layer.
                */
                this.typeAheadSuggestions = [];
                this.selectedSuggestionIndex = -1;                
                this.$store.dispatch('search/setQText', this.qTextInternal === null ? '' : this.qTextInternal);
            },
            clearAndUpdate() {
                this.blockSuggestionRefresh = true;
                this.updateQText();
            },
            keyUp() {
                /*
                    Change the selected/highlighted item in the type-ahead suggestions list
                */
                if (this.selectedSuggestionIndex === -1) {
                    this.selectedSuggestionIndex = this.typeAheadSuggestions.length - 1;
                } else {
                    this.selectedSuggestionIndex = (this.selectedSuggestionIndex + this.typeAheadSuggestions.length - 1) % this.typeAheadSuggestions.length;
                }
            },
            keyDown() {
                /*
                    Change the selected/highlighted item in the type-ahead suggestions list
                */
                this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % this.typeAheadSuggestions.length;
            },
            keyTab(evt) {
                evt.preventDefault();   
                /*
                    If a type-ahead suggestion has been selected and the user hits the tab key,
                    set the suggestion as the value for qTextInternal.
                */
                if (this.selectedSuggestionIndex !== -1) {
                    this.blockSuggestionRefresh = true;
                    this.qTextInternal = this.typeAheadSuggestions[this.selectedSuggestionIndex];
                    this.typeAheadSuggestions = [];
                    this.selectedSuggestionIndex = -1;
                }
            },
            typeAheadSuggestionsClick(evt, index) {
                this.selectedSuggestionIndex = index;
                this.$refs.searchbox.$refs.input.focus();
                this.keyTab(evt);
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                qText: state => state.search.qText
            })
        },
        watch: {
            // Watcher for external representation of qText
            qText(value) {
                if (!this.setInternally) {
                    /*
                        The Vuex prop, qText, has been set outside of this component so assign it to
                        the internal value
                    */
                    this.qTextInternal = value;
                    this.setExternally = true;
                } else {
                    /*
                        The Vuex prop, qText, has been set internally (via user interaction) so execute the search.
                    */
                    this.setInternally = false;
                    this.$store.dispatch('search/executeSearch')
                        .then((response) => {})
                        .catch((error) => { console.log(error); })
                        .finally(() => {});
                }                
            },
            // Watcher for internal representation of qText
            qTextInternal(value) {
                if (!this.setExternally) {
                    // The value has been set internally (via user interaction).
                    if (this.blockSuggestionRefresh) {
                        this.blockSuggestionRefresh = false;
                    } else {
                        // Get type-ahead suggetions.
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