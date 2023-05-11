import { handleAxiosCatch } from '../../local.js';

const PROXY_PREFIX = 'http://' + process.env.VUE_APP_PROXY_HOST + ':' + process.env.VUE_APP_PROXY_PORT;

export const authState = (function() {
	return function() {
		//return function() {
		return {
			namespaced: true,
			state: {
				authenticated: undefined,
				username: undefined,
                submissionStatus: 0,
                AJAXResponseStatus: 0,
                error: undefined,
			},
			mutations: {
				logIn(state, username) {
					state.authenticated = true;
					state.username = username;
				},
				logOut(state) {
					state.authenticated = false;
					state.username = undefined;
				},
				setAuthenticationState(state, currentState) {
					state.authenticated = currentState.authenticated;
                    state.username = currentState.username;
				},
                setSubmissionStatus(state, status) {
                    state.submissionStatus = status;
                },
                setAJAXResponseStatus(state, status) {
                    state.AJAXResponseStatus = status;
                },
				setError(state, error) {
					state.error = error
				},
                clearError(state) {
                    state.error = undefined;
                }
			},
			actions: {
				logIn({ commit }, { username, password }) {
                    commit("clearError");
                    commit("setSubmissionStatus", 1);

                    return axios.put(PROXY_PREFIX + '/auth/in', { username: username, password: password })
                        .then(function (response) {
                            if (process.env.VUE_APP_AUTH_WITH_TARGET_ON_AUTH === 'true') {
                                return axios({
                                    method: 'GET',
                                    url: PROXY_PREFIX + '/v1/search?',
                                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                                })
                                    .then(function () {
                                        commit("logIn", username);
                                        commit("setSubmissionStatus", 2);
                                        commit("setAJAXResponseStatus", response.status);
                                        return Promise.resolve("logIn resolved");                                
                                    })
                                    /*.catch(function (error) {
                                        let errorInfo = handleAxiosCatch(error);
                                        commit("setSubmissionStatus", 3);
                                        commit("setAJAXResponseStatus", errorInfo.status);
                                        commit('setError', errorInfo);
                                        return Promise.reject("logIn rejected");
                                    })*/;
                            } else {
                                commit("logIn", username);
                                commit("setSubmissionStatus", 2);
                                commit("setAJAXResponseStatus", response.status);
                                return Promise.resolve("logIn resolved");                                
                            }
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit('setError', errorInfo);
                            return Promise.reject("logIn rejected");
                        });
				},
				logOut({ commit }) {
                    commit("clearError");
                    commit("setSubmissionStatus", 1);

                    return axios.get(PROXY_PREFIX + '/auth/out')
                        .then(function (response) {
                            commit("logOut");
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("logOut resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit('setError', errorInfo);
                            return Promise.reject("logOut rejected");
                        });
				},
				getAuthenticated({ commit }) {
                    commit("clearError");
                    commit("setSubmissionStatus", 1);

                    return axios.get(PROXY_PREFIX + '/auth/status')
                        .then(function (response) {
                            commit("setAuthenticationState", response.data);
                            commit("setSubmissionStatus", 2);
                            commit("setAJAXResponseStatus", response.status);
                            return Promise.resolve("getAuthenticated resolved");
                        })
                        .catch(function (error) {
                            let errorInfo = handleAxiosCatch(error);
                            commit("setSubmissionStatus", 3);
                            commit("setAJAXResponseStatus", errorInfo.status);
                            commit('setError', errorInfo);
                            return Promise.reject("getAuthenticated rejected");
                        });
				}
			}

		};
	};
})();