import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import Cookies from 'js-cookie'
const state = {
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    cyptoKey: 'win-wx-AES-crypt'
}

const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
        state.introduction = introduction
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles;
    },
    SET_CYPTOKEY: (state, key) => {
        state.cyptoKey = key
    }
}

const actions = {
    // user login
    login({ commit }, userInfo) {
        const { username, password ,remember } = userInfo
        return new Promise((resolve, reject) => {
            login({ username: username.trim(), password: password,remember:remember }).then(response => {
                if(response.code === 20000){
                    const { roles, username, avatar,enabled } = response.data
                    var role = [];
                    role.push(roles);
                    commit('SET_ROLES', role)
                    commit('SET_NAME', username)
                    commit('SET_AVATAR', avatar)
                }
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // get user info
    getInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            getInfo(state.token).then(response => {
                const { data } = response
                if (!data) {
                    reject('Verification failed, please Login again.')
                }
                const { roles, username, avatar } = data
                // roles must be a non-empty array
                if (!roles || roles.length <= 0) {
                    reject('getInfo: roles must be a non-null array!')
                }
                var role = [];
                role.push(roles);
                commit('SET_ROLES', role)
                commit('SET_NAME', username)
                commit('SET_AVATAR', avatar)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },

    // user logout
    logout({ commit, state }) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                commit('SET_TOKEN', '')
                commit('SET_ROLES', [])
                commit('SET_NAME', '')
                commit('SET_AVATAR', '')
                removeToken()
                resetRouter()
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // remove token
    resetToken({ commit }) {
        return new Promise(resolve => {
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            removeToken()
            resolve()
        })
    },

    // dynamically modify permissions
    changeRoles({ commit, dispatch }, role) {
        return new Promise(async resolve => {
            const token = role + '-token'
            commit('SET_TOKEN', token)
            setToken(token)
            const { roles } = await dispatch('getInfo')
            resetRouter()
                // generate accessible routes map based on roles
            const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
                // dynamically add accessible routes
            router.addRoutes(accessRoutes)
                // reset visited views and cached views
            dispatch('tagsView/delAllViews', null, { root: true })
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
