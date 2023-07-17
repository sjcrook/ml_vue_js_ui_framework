import { handleAxiosCatch } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const searchState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
                qText: '',
				structuredQuery: undefined,
                start: 1,
                pageLength: 10,
                optionsStr: process.env.VUE_APP_SEARCH_OPTIONS_STR_DEFAULT,
                options: undefined,
                sortState: undefined,
				results: {},
                submissionStatus: 0,
                AJAXResponseStatus: 0,
				submissionError: undefined
			},
			mutations: {
                setQText(state, qText) {
                    state.qText = qText;
                },
                setStructuredQuery(state, structuredQuery) {
                    state.structuredQuery = structuredQuery;
                },
                setStart(state, start) {
                    state.start = start;
                },
                setPageLength(state, pageLength) {
                    state.pageLength = pageLength;
                },
                setOptionsStr(state, optionsStr) {
                    state.optionsStr = optionsStr;
                },
                setOptions(state, options) {
                    state.options = options;
                },
                setSortState(state, sortState) {
                    state.sortState = sortState;
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
                setQText({ commit }, qText) {
                    commit('setQText', qText);
                    commit('setStart', 1);
                },
                setStructuredQuery({ commit }, structuredQuery) {
                    commit('setStructuredQuery', structuredQuery);
                    commit('setStart', 1);
                },
                setStart({ commit }, start) {
                    commit('setStart', start);
                },
                setPageLength({ commit }, pageLength) {
                    commit('setPageLength', pageLength);
                    commit('setStart', 1);
                },
                setOptionsStr({ commit }, optionsStr) {
                    commit('setOptionsStr', optionsStr);
                    commit('setStart', 1);
                },
                setOptions({ commit }, options) {
                    commit('setOptions', options);
                    commit('setStart', 1);
                },
                setSortState({ commit }, sortState) {
                    commit('setSortState', sortState);
                    commit('setStart', 1);
                },
                executeSearch({ commit, state }) {
                    commit("clearSubmissionError");
                    commit("setSubmissionStatus", 1);

                    const qStr = new URLSearchParams({
                        q: (state.sortState && !state.qText.includes('sort:')) ? state.qText + ' sort:' + state.sortState : state.qText,
                        start: state.start,
                        pageLength: state.pageLength,
                        options: state.optionsStr,
                        format: 'json'
                    });

                    return axios({
                        method: 'POST',
                        url: PROXY_PREFIX + '/v1/search?' + qStr.toString(),
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        data: JSON.stringify(state.structuredQuery)
                    })
                        .then(function (response) {
                            commit("setResults", response.data);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("executeSearch resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit("setSubmissionError", errorInfo.data);
                            return Promise.reject("executeSearch rejected");
                        });
                },
                getOptions({ commit, state }) {
                    commit("clearSubmissionError");
                    commit("setSubmissionStatus", 1);

                    return axios({
                        method: 'GET',
                        url: PROXY_PREFIX + '/v1/config/query/' + state.optionsStr + '?format=json',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                    })
                        .then(function (response) {
                            commit("setOptions", response.data.options);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("getOptions resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit("setSubmissionError", errorInfo.data);
                            return Promise.reject("getOptions rejected");
                        });
                }
			}

		};
	};
})();