<template>

    <v-card
        v-if="displayWhenEmpty || values.length > 0"
    >
        <v-toolbar
            color="primary"
            dense
        >  
            <v-toolbar-title class="complement--text">
                <span>{{ capitalizeFacetName(name) }}</span> <span v-if="amountChecked > 0">({{ amountChecked }})</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>  
            <v-btn
                color="complement"
                icon
                @click="expanded = !expanded"
              >
                <v-icon
                    v-if="expanded"
                >
                    mdi-chevron-up
                </v-icon>
                <v-icon
                    v-else
                >
                    mdi-chevron-down
                </v-icon>
              </v-btn>
        </v-toolbar>

        <v-card-text
            v-if="expanded"
        >
            <v-container
                v-if="values.length > 0"
            >
                <v-row v-for="(item, index) in internalValuesTruncatedSorted" :key="name + '-f-' + index">
                    <v-col cols="1" class="pa-0">
                        <!-- v-model="item.checked" -->
                        <v-simple-checkbox
                            :value="item.checked"
                            @input="checkboxChange(item, $event)"
                        ></v-simple-checkbox>
                    </v-col>
                    <v-col class="pa-0">
                        {{ item.value }}
                    </v-col>
                    <v-spacer/>
                    <v-col style="text-align: right" class="pa-0" cols="2">{{ item.count }}</v-col>

                </v-row>
                <v-row
                    v-if="internalValues.length > lesserAmountToDisplay"
                >
                    <v-col
                        class="d-flex justify-end"
                    >
                        <v-btn
                            text
                            color="primary"
                            @click="showAll = !showAll"
                        >
                            {{ moreLessText }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
            <v-container
                v-else
            >
                <v-row>
                    <v-col>No facet data to show</v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>

</template>

<script>

    import { mapState } from "vuex";
    import { eventHandler } from '../../local.js';
    
    export default {
        mixins: [],
        props: {
            name: {
                type: String,
                default: undefined
            },
            displayWhenEmpty: {
                type: Boolean,
                default: true
            },
            lesserAmountToDisplay: {
                type: Number,
                default: 7
            }
        },
        data() {
            return {
                internalValues: [],
                structuredQueryInternal: {},
                expanded: true,
                showAll: false,
                /*

                    The following two flags determine whether a change occurred
                    inside or outside a component so as to prevent infinite update loops.
                */
                setInternally: false,
                setExternally: false 
            }
        },
        created() {
            // Listen for events from the SearchFacetChipViewer component.
            eventHandler.listen('facet-viewer.' + this.name + '.removeChip', this.unCheckItem);
        },
        mounted() {
            /*
                Copy the external facet data representation in the Vuex persistence layer
                to the internal representation.
            */
            this.copyValuesToInternal();
        },
        beforeDestroy() {
            // Stop listening for events from the SearchFacetChipViewer component.
            eventHandler.stopListening('facet-viewer.' + this.name + '.removeChip', this.unCheckItem);
        },
        methods: {
            copyValuesToInternal() {
                /*

                */
                const additions = [];
                const deletions = [];
                /*
                    If internalValues doesn't include a value from the search results
                    then push the value on to the additions list.
                */
                this.values.forEach(item => {
                    if (!this.internalValues.map(item2 => item2.value).includes(item.value)) {
                        additions.push({ ...item, name: this.name, checked: false});
                    }
                });
                /*
                    Update count value for each item in internalValues
                */
                this.values.forEach(item => {
                    const index = this.internalValues.findIndex(item2 => item2.value === item.value);
                    this.internalValues.splice(index, 1, { ...this.internalValues[index], count: item.count });
                });
                /*
                    If internalValues has an item that doesn't exist in the search results
                    then push the value on to the deletions list.
                */
                this.internalValues.forEach(item => {
                    if (!this.values.map(item2 => item2.value).includes(item.value)) {
                        deletions.push(item);
                    }
                });
                // Push the additions onto the internalValues list.
                additions.forEach(item => this.internalValues.push(item));
                // Remove the values in deletions from the internalValues list.
                deletions.forEach(item => {
                    // If the item is checked, send an event to SearchFacetChipViewer to remove a chip.
                    if (item.checked) {
                        this.dispatchRemoveChip(item);
                    }
                    this.internalValues.splice(this.internalValues.findIndex(item2 => item2.value === item.value), 1);
                });
                this.internalValues.forEach(item => {
                    // If the item is checked, send an event to SearchFacetChipViewer to add a chip.
                    item.checked = this.checkedValues.includes(item.value);
                    if (item.checked) {
                        this.dispatchAddChip(item);
                    }
                });
            },
            setStructuredQuery() {
                /*
                    Every time a user adds or removes a facet value,
                    reconstruct the structuredQuery.
                */

                // Create constraint object.
                const structuredQueryPartial = {
                    "range-constraint-query": {
                        "constraint-name": this.name,
                        "value": this.internalValues.filter(item => item.checked).map(item => item.value)
                    }
                };

                let localStructuredQuery;

                // Create a copy of the current structuredQuery from the Vuex persistence layer
                if (this.structuredQuery === undefined) {
                    localStructuredQuery = [];
                } else {
                    localStructuredQuery = JSON.parse(JSON.stringify(this.structuredQuery.query.queries[0]['and-query'].queries));
                }

                // Get index of range-constraint-query object with the name of this facet
                const index = localStructuredQuery.findIndex(item => item.hasOwnProperty('range-constraint-query') && item['range-constraint-query']['constraint-name'] === structuredQueryPartial['range-constraint-query']['constraint-name']);
                if (structuredQueryPartial['range-constraint-query'].value.length === 0) {
                    if (index !== -1) {
                        /*
                            There are no checked facet values in internalValues so remove the named
                            constraint from localStructuredQuery.
                        */
                        localStructuredQuery.splice(index, 1);
                    }
                } else {
                    if (index !== -1) {
                        /*
                            There's a range-constraint-query with this facet name
                            so replace with the partial.
                        */
                        localStructuredQuery.splice(index, 1, structuredQueryPartial);
                    } else {
                        /*
                            There are no range-constraint-query entries with this facet name
                            so add the partial.
                        */
                        localStructuredQuery.push(structuredQueryPartial);
                    }
                }

                // Wrap the localStructuredQuery in a wrapper that the REST API endpoint will accept.
                const wrappedStructuredQuery = {
                    "query": {
                        "queries": [{
                            "and-query": {
                                "queries": localStructuredQuery
                            }
                        }]
                    }
                };
                this.structuredQueryInternal = wrappedStructuredQuery;
            },
            checkboxChange(changedItem, value) {
                // Update the internalValues representation.
                this.$set(this.internalValues[this.internalValues.findIndex(item => item.name === changedItem.name && item.value === changedItem.value)], 'checked', value);
                if (value) {
                    // Checked so send a message to SearchFacetChipViewer to add chip.
                    this.dispatchAddChip(changedItem);
                } else {
                    // Unchecked so send a message to SearchFacetChipViewer to remove chip.
                    this.dispatchRemoveChip(changedItem);
                }
                // Update structuredQuery
                this.setStructuredQuery();
            },
            unCheckItem(itemToUnCheck) {
                // Handler to respond to events from SearchFacetChipViewer
                this.$set(this.internalValues[this.internalValues.findIndex(item => item.name === itemToUnCheck.name && item.value === itemToUnCheck.value)], 'checked', false);
                this.setStructuredQuery();
            },
            dispatchAddChip(item) {
                eventHandler.dispatch(
                    'facet-chip-viewer.addChip',
                    item
                );
            },
            dispatchRemoveChip(item) {
                eventHandler.dispatch(
                    'facet-chip-viewer.removeChip',
                    item
                );
            },
            capitalizeFacetName(name) {
                return name.charAt(0).toUpperCase() + name.slice(1);
            }
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                structuredQuery: state => state.search.structuredQuery
            }),
            values() {
                // Get facet results for this facet name from search results in Vuex persistence layer
                let result;
                const results = this.$store.state.search.results;
                if (results.facets && results.facets[this.name] && results.facets[this.name].facetValues) {
                    result = results.facets[this.name].facetValues;
                } else {
                    result = [];
                }
                return result;
            },
            internalValuesTruncatedSorted() {
                // copyValuesToInternal function doesn't honor sort order (by count) so resort.
                this.internalValues.sort((a, b) => b.count - a.count);
                if (!this.showAll) {
                    // Not showing all so restrict to lesserAmountToDisplay
                    return this.internalValues.slice(0, this.lesserAmountToDisplay);
                } else {
                    return this.internalValues;
                }
            },
            amountChecked() {
                // Calculate the number of checked facet values (to display next to facet name in rendering)
                return this.internalValues.filter(item => item.checked).length;
            },
            checkedValues() {
                // Return list of facet values that are checked/selected.
                if (this.structuredQuery !== undefined) {
                    const rangeConstraintQueries = this.structuredQuery.query.queries[0]['and-query'].queries.filter(item => {
                        if (item['range-constraint-query'] && item['range-constraint-query']['constraint-name'] === this.name) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (rangeConstraintQueries.length === 1) {
                        return rangeConstraintQueries[0]['range-constraint-query'].value;
                    } else {
                        return [];
                    }
                } else {
                    return [];
                }
            },
            moreLessText() {
                if (this.showAll) {
                    return 'show less';
                } else {
                    return 'show more';
                }
            }
        },
        watch: {
            values: {
                deep: true,
                handler(value) {
                    // Create a new internal representation when search results facet data changes.
                    this.copyValuesToInternal();
                }
            },
            structuredQueryInternal: {
                deep: true,
                handler(value) {
                    // When structuredQuery changes, set it in the persistence layer and execute search.
                    this.$store.dispatch('search/setStructuredQuery', value);
                    this.$store.dispatch('search/executeSearch')
                        .then((response) => {})
                        .catch((error) => { console.log(error); })
                        .finally(() => {});
                }
            }
        }
    }

</script>

<style scoped>
    header.v-toolbar {
        height: 36px !important;
    }
    header.v-toolbar >>> .v-toolbar__content {
        height: 36px !important;
    }
</style>