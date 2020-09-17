import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken,setToken,removeToken } from '@/utils/auth'
import qs from 'qs'
import Router from '@/router' 
import { serverPath } from '@/settings'
// create an axios instance
const service = axios.create({
    baseURL:  process.env.VUE_APP_BASE_API,//serverPath , // url = base url + request url
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000, // request timeout
    headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' ,
        // 'token':getToken()
    },
    transformRequest: [function(data, headers) {
        if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            data = qs.stringify(data)
        }
        return data;
    }],
})

// request interceptor
service.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    response => {
        let res = response.data;
        if (res.code === 20000) {
            return res
        } else {
            Message({
                message: res.message || '嘿嘿嘿，服务器打了个盹！',
                type: 'error',
                duration: 5 * 1000
            })
            if(res.code === 20011){
                removeToken();
                Router.push('/login');
            }
            return Promise.reject(new Error(res.message || 'Error'))
        }
    },
    error => {
        Message({
            message: '网络貌似出了点问题，请稍候重试',
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service
