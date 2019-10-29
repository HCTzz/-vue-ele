import request from '@/utils/request'

export function backstageValid(params, url) {
    // return {
    //     code: 30000,
    //     message: '测试'
    // }
    return request({
        url: url,
        method: 'get',
        params
    })
}
