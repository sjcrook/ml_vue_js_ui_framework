<template>

    <div>

        <!--
            :light="!isBackgroundDark(sb.color)"
            :dark="isBackgroundDark(sb.color)"            
        -->
        <v-snackbar
            v-for="(sb, i) in snackBarList"
            :key="'sb-' + i"
            app
            v-model="sb.visible"
            :color="sb.color"
            timeout="-1"
            top
            :style="'margin-top:' + calcMargin(i)"
        >
            <span>{{ sb.message }}</span>
            <template v-slot:action="{ attrs }">
                <v-btn
                    icon
                    v-bind="attrs"
                    @click="removeSnackBar(sb.id)"
                >
                    <v-icon color="complement">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>

    </div>

</template>

<script>

    import { eventHandler } from '../local.js';

    export default {
        data() {
            return {
                defaults: {
                    color: 'info'
                },
                snackBarList: []
            }
        },
        created() {
            // listen for addSnackBar events
            eventHandler.listen('masterSnackBar', this.addSnackBar);
        },
        beforeDestroy() {
            // stop listening for addSnackBar events
            eventHandler.stopListening('masterSnackBar', this.addSnackBar);
        },
        methods: {
            addSnackBar(data) {
                /*
                    Push the data for the snackbar onto the snackbar array
                    which is rendered by the template.
                */
                let that = this;
                // The id is used to identify the snackbar upon removal
                let id = parseInt(Math.random() * 1000000);
                this.snackBarList.push({
                    id: id,
                    message: data.message,
                    color: data.color || this.defaults.color,
                    visible: true,
                    timeoutID: data.timeout ? setTimeout(() => {
                        that.removeSnackBar(id);
                    }, data.timeout) : null
                });
            },
            removeSnackBar(id) {
                // Find the snackbar by id and remove from array.
                let index = this.snackBarList.findIndex(item => item.id === id);
                if (index !== -1) {
                    clearTimeout(this.snackBarList[index].timeoutID);
                    this.snackBarList.splice(index, 1);
                }
            },
            calcMargin(i) {
                /*
                    Multiple snackbars can be visible at once.  This function determines
                    the margin height so for each one in the array so that they don't
                    overlay each other.
                */
                return ((this.snackBarList.length - i - 1) * 70) + 'px';
            }
        }
    }
</script>