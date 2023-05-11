<template>

    <div>
        <v-chip
            v-for="(item, index) in chips" :key="'chips-' + index"
            class="ma-2"
            close
            color="primary"
            outlined
            @click:close="removeChipHandler(item)"
        >
            {{ item.name }}: {{ item.value }} 
        </v-chip>
    </div>

</template>

<script>

    import { eventHandler } from '../../local.js';

    export default {
        mixins: [],
        components: {
        },
        model: {
            event: 'change'
        },
        data() {
            return {
                chips: []
            }
        },
        created() {
            eventHandler.listen('facet-chip-viewer.addChip', this.addChip);
            eventHandler.listen('facet-chip-viewer.removeChip', this.removeChip);
        },
        mounted() {
        },
        beforeDestroy() {
            eventHandler.stopListening('facet-chip-viewer.addChip', this.addChip);
            eventHandler.stopListening('facet-chip-viewer.removeChip', this.removeChip);
        },
        methods: {
            addChip(itemToAdd) {
                if (this.chips.findIndex(item => item.name === itemToAdd.name && item.value === itemToAdd.value) === -1) {
                    this.chips.push(itemToAdd);
                    this.$emit('change', this.chips.length);
                }
            },
            removeChip(item) {
                this.chips.splice(this.chips.findIndex(chipsItem => chipsItem.name === item.name && chipsItem.value === item.value), 1);
                this.$emit('change', this.chips.length);
            },
            dispatchUnCheckItem(item) {
                eventHandler.dispatch(
                    'facet-viewer.' + item.name + '.removeChip',
                    item
                );
            },
            removeChipHandler(item) {
                this.dispatchUnCheckItem(item);
                this.removeChip(item);
            },
        },
        computed: {
        },
        watch: {
        }
    }

</script>

<style scoped>
</style>