import Vue from 'vue';

class EventHandler {

    constructor() {
        this.ignoreEventList = [];
        this.vue = new Vue();
    }

    dispatch(event, data = null) {
        if (this.eventEnabled(event)) {
            this.vue.$emit(event, data);
        }
    }

    listen(event, callback) {
        this.vue.$on(event, callback);
    }

    stopListening(event, callback) {
        this.vue.$off(...[event, callback]);
    }

    disableEvent(event) {
        if (!this.ignoreEventList.includes(event)) {
            this.ignoreEventList.push(event);
        }
    }

    enableEvent(event) {
        const index = this.ignoreEventList.indexOf(event);
        if (index > -1) {
            this.ignoreEventList.splice(index, 1);
        }
    }

    eventEnabled(event) {
        return !this.ignoreEventList.includes(event);
    }
}

export const eventHandler = new EventHandler();