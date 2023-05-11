import { handleAxiosCatch } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const documentManagementState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
                documentURI: undefined,
                documentData: undefined,
                submissionStatus: 0,
                AJAXResponseStatus: 0,
				submissionError: undefined
			},
			mutations: {
                setDocumentURI(state, documentURI) {
                    state.documentURI = documentURI;
                },
                setDocumentData(state, documentData) {
                    state.documentData = documentData;
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
                setDocumentURI({ commit }, documentURI) {
                    commit('setDocumentURI', documentURI);
                },
                documentGet({ commit, state }) {
                    commit("clearSubmissionError");
                    commit("setSubmissionStatus", 1);

                    const qStr = new URLSearchParams({
                        uri: state.documentURI
                    });
                    return axios({
                        method: 'GET',
                        url: PROXY_PREFIX + '/v1/documents?' + qStr.toString(),
                        //headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                    })
                        .then(function (response) {
                            commit("setDocumentData", response.data);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("documentGet resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit("setSubmissionError", errorInfo.data);
                            return Promise.reject("documentGet rejected");
                        });
                }
			}

		};
	};
})();