import request from '@/utils/request'
import {serverPath} from '@/settings'
import qs from 'qs'

export function getVideoList(data) {
    return request({
        url: '/video/list',
        method: 'get',
        params: data
      })
}

export function updateVideo(data) {
  return request({
      url: '/video/updateVideo',
      method: 'post',
      data
    })
}

export function downloadVideo(fileKey) {
  window.location.href = serverPath + '/video/priviewVideo?fileKey='+fileKey;
}
