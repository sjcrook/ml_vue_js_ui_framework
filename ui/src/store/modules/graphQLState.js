import { handleAxiosCatch, store } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const graphQLState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
                query: undefined,
				results: undefined,
                submissionStatus: 0,
                AJAXResponseStatus: 0,
				submissionError: undefined
			},
			mutations: {
                setQuery(state, query) {
                    state.query = query;
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
                clearResults({ commit }) {
                    commit('setResults', undefined);
                },
                executeQuery({ commit, state }) {
                    commit("clearSubmissionError");
                    commit("setSubmissionStatus", 1);

                    return axios({
                        method: 'POST',
                        url: PROXY_PREFIX + '/v1/rows/graphql',
                        headers: { 'Content-Type': 'application/graphql' },
                        data: { query: state.query }
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