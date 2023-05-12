import { handleAxiosCatch, store } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const rowsState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
                payload: undefined,
                payloadType: 'js',
                bindings: {},
                optimize: 0, // 1 or 2
                responseFormat: 'application/json',
				results: {},
                submissionStatus: 0,
                AJAXResponseStatus: 0,
				submissionError: undefined
			},
			mutations: {
                setPayload(state, payload) {
                    state.payload = payload;
                },
                setPayloadType(state, payloadType) {
                    state.payloadType = payloadType;
                },
                addBinding(state, binding) {
                    const b = { ...binding };
                    delete b.name;
                    this._vm.$set(state.bindings, binding.name, b);
                },
                removeBinding(state, name) {
                    this._vm.$delete(state.bindings, name);
                },
                clearBindings() {
                    state.bindings = {};
                },
                setOptimize(state, optimize) {
                    state.optimize = optimize;
                },
                setResponseFormat(state, responseFormat) {
                    state.responseFormat = responseFormat;
                },
                setResults(state, results) {
                    state.results = results;
                },
                setSubmissionStatus(state, status) {
                    state.submissionStatus = status;
                },
                setAJAXResponseStatus(state, status) {
                    state.AJAXResponseStatus = status;
                },
                setSubmissionError(state, error) {
                    state.submissionError = error;
                },
                clearSubmissionError(state, error) {
                    state.submissionError = undefined;
                }
			},
			actions: {
                setPayload({ commit }, payload) {
                    commit('setPayload', payload);
                },
                setPayloadType({ commit }, payloadType) {
                    commit('setPayloadType', payloadType);
                },
                addBinding({ commit }, binding) {
                    commit('addBinding', binding);
                },
                removeBinding({ commit }, name) {
                    commit('removeBinding', name);
                },
                clearBindings({ commit }) {
                    commit('clearBindings');
                },
                setOptimize({ commit }, optimize) {
                    commit('setOptimize', optimize);
                },
                setResponseFormat({ commit }, responseFormat) {
                    commit('setResponseFormat', responseFormat);
                },
                clearResults({ commit }) {
                    commit('setResults', undefined);
                },
                execute({ commit, state }) {
                    commit("clearSubmissionError");
                    commit("setSubmissionStatus", 1);

                    const bindings = {};

                    for (const [pName, pObj] of Object.entries(state.bindings)) {
                        const arr = [ 'bind', pName ];
                        if (pObj.type === 'string' && pObj.lang === '' || pObj.type !== 'string') {
                            arr.push(pObj.type)
                        }
                        let qStrP = arr.join(':');
                        if (pObj.type === 'string' && pObj.lang !== '') {
                            qStrP += '@' + pObj.lang;
                        }
                        bindings[qStrP] = pObj.value;
                    }

                    const qStr = new URLSearchParams({
                        ...bindings,
                        optimize: state.optimize
                    });

                    const contentType = state.payloadType === 'json' ? 'application/json' : 'application/vnd.marklogic.querydsl+javascript';

                    return axios({
                        method: 'POST',
                        url: PROXY_PREFIX + '/v1/rows?' + qStr.toString(),
                        headers: { 'Content-Type': contentType, 'Accept': state.responseFormat },
                        data: state.payload
                    })
                        .then(function (response) {
                            commit("setResults", response.data);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("execute resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit("setSubmissionError", errorInfo.data);
                            return Promise.reject("execute rejected");
                        });
                }
			}

		};
	};
})();