import { handleAxiosCatch, store } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const graphsSPARQLState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
                query: undefined,
                dedup: 'on', // or 'off'
                start: 1,
                pageLength: undefined,
                includeSearch: false, // or true
                bindings: {},
                optimize: 0, // 1 or 2
                responseFormat: 'application/json',
				results: undefined,
                submissionStatus: 0,
                AJAXResponseStatus: 0,
				submissionError: undefined
			},
			mutations: {
                setQuery(state, query) {
                    state.query = query;
                },
                setDedup(state, dedup) {
                    state.dedup = dedup;
                },
                setStart(state, start) {
                    state.start = start;
                },
                setPageLength(state, pageLength) {
                    state.pageLength = pageLength;
                },
                setIncludeSearch(state, includeSearch) {
                    state.includeSearch = includeSearch;
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
                setQuery({ commit }, query) {
                    commit('setQuery', query);
                },
                setDedup({ commit }, dedup) {
                    commit('setDedup', dedup);
                },
                setStart({ commit }, start) {
                    commit('setStart', start);
                },
                setPageLength({ commit }, pageLength) {
                    commit('setPageLength', pageLength);
                },
                setIncludeSearch({ commit }, includeSearch) {
                    commit('setIncludeSearch', includeSearch);
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
                executeQuery({ commit, state }) {
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
                        dedup: state.dedup,
                        start: state.start,
                        ...bindings,
                        optimize: state.optimize
                    });

                    if (state.pageLength !== undefined) {
                        qStr.append('pageLength', state.pageLength);
                    }

                    if (state.includeSearch) {
                        const qText = store.state.search.qText;
                        if (qText) {
                            qStr.append('q', qText);
                        }
                        const structuredQuery = store.state.search.structuredQuery;
                        if (structuredQuery !== undefined) {
                            qStr.append('structuredQuery', JSON.stringify(structuredQuery));
                        }
                    }

                    return axios({
                        method: 'POST',
                        url: PROXY_PREFIX + '/v1/graphs/sparql?' + qStr.toString(),
                        headers: { 'Content-Type': 'application/sparql-query', 'Accept': state.responseFormat },
                        data: state.query
                    })
                        .then(function (response) {
                            commit("setResults", response.data);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("executeQuery resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit("setSubmissionError", errorInfo.data);
                            return Promise.reject("executeQuery rejected");
                        });
                }
			}

		};
	};
})();