import request from '@/utils/request'
import {serverPath} from '@/settings'
import qs from 'qs'

export function getTopCount() {
    return request({
        url: '/topCount',
        method: 'get',
    })
}

export function getLineCharts() {
    return request({
        url: '/lineChart',
        method: 'get',
    })
}