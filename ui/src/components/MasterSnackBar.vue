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
            eventHandler.listen('masterSnackBar', this.addSnackBar);
        },
        beforeDestroy() {
            eventHandler.stopListening('masterSnackBar', this.addSnackBar);
        },
        methods: {
            addSnackBar(data) {
                let that = this;
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
                let index = this.snackBarList.findIndex(item => item.id === id);
                if (index !== -1) {
                    clearTimeout(this.snackBarList[index].timeoutID);
                    this.snackBarList.splice(index, 1);
                }
            },
            calcMargin(i) {
                return ((this.snackBarList.length - i - 1) * 70) + 'px';
            }
        }
    }
</script>