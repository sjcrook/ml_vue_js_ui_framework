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
                setInternally: false,
                setExternally: false 
            }
        },
        created() {
            eventHandler.listen('facet-viewer.' + this.name + '.removeChip', this.unCheckItem);
        },
        mounted() {
            this.copyValuesToInternal();
        },
        beforeDestroy() {
            eventHandler.stopListening('facet-viewer.' + this.name + '.removeChip', this.unCheckItem);
        },
        methods: {
            copyValuesToInternal() {
                const additions = [];
                const replacements = [];
                const deletions = [];
                this.values.forEach(item => {
                    if (!this.internalValues.map(item2 => item2.value).includes(item.value)) {
                        additions.push({ ...item, name: this.name, checked: false});
                    }
                });
                this.values.forEach(item => {
                    const index = this.internalValues.findIndex(item2 => item2.value === item.value);
                    this.internalValues.splice(index, 1, { ...this.internalValues[index], count: item.count });
                });
                this.internalValues.forEach(item => {
                    if (!this.values.map(item2 => item2.value).includes(item.value)) {
                        deletions.push(item);
                    }
                });
                additions.forEach(item => this.internalValues.push(item));
                deletions.forEach(item => {
                    if (item.checked) {
                        this.dispatchRemoveChip(item);
                    }
                    this.internalValues.splice(this.internalValues.findIndex(item2 => item2.value === item.value), 1);
                });
                this.internalValues.forEach(item => {
                    item.checked = this.checkedValues.includes(item.value);
                    if (item.checked) {
                        this.dispatchAddChip(item);
                    }
                });
            },
            setStructuredQuery() {
                const structuredQueryPartial = {
                    "range-constraint-query": {
                        "constraint-name": this.name,
                        "value": this.internalValues.filter(item => item.checked).map(item => item.value)
                    }
                };

                let localStructuredQuery;

                if (this.structuredQuery === undefined) {
                    localStructuredQuery = [];
                } else {
                    localStructuredQuery = JSON.parse(JSON.stringify(this.structuredQuery.query.queries[0]['and-query'].queries));
                }

                if (structuredQueryPartial.hasOwnProperty('range-constraint-query')) {
                    const index = localStructuredQuery.findIndex(item => item.hasOwnProperty('range-constraint-query') && item['range-constraint-query']['constraint-name'] === structuredQueryPartial['range-constraint-query']['constraint-name']);
                    if (structuredQueryPartial['range-constraint-query'].value.length === 0) {
                        if (index !== -1) {
                            // found so remove
                            localStructuredQuery.splice(index, 1);
                        }
                    } else {
                        if (index !== -1) {
                            // found so replace
                            localStructuredQuery.splice(index, 1, structuredQueryPartial);
                        } else {
                            // not found so add
                            localStructuredQuery.push(structuredQueryPartial);
                        }
                    }
                } else {
                    console.log('error: unknown structuredQueryPartial property name');
                }
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
                this.$set(this.internalValues[this.internalValues.findIndex(item => item.name === changedItem.name && item.value === changedItem.value)], 'checked', value);
                if (value) {
                    this.dispatchAddChip(changedItem);
                } else {
                    this.dispatchRemoveChip(changedItem);
                }
                this.setStructuredQuery();
            },
            unCheckItem(itemToUnCheck) {
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
            ...mapState({
                structuredQuery: state => state.search.structuredQuery
            }),
            values() {
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
                this.internalValues.sort((a, b) => b.count - a.count);
                if (!this.showAll) {
                    return this.internalValues.slice(0, this.lesserAmountToDisplay);
                } else {
                    return this.internalValues;
                }
            },
            amountChecked() {
                return this.internalValues.filter(item => item.checked).length;
            },
            checkedValues() {
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
                    this.copyValuesToInternal();
                }
            },
            structuredQueryInternal: {
                deep: true,
                handler(value) {
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