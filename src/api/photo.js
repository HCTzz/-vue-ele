import request from '@/utils/request'
import qs from 'qs'

export function getFileList(data) {
    return request({
        url: '/photo/photoList',
        method: 'get',
        params: data
      })
}

export function addPhoto(data) {
  return request({
    url: '/photo/addPhoto',
    method: 'post',
    data
  })
}

export function batchAddPhoto(data) {
  return request({
    url: '/photo/batchAddPhoto',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data:JSON.stringify(data)
  })
}

export function updatePhoto(data) {
  return request({
    url: '/photo/updatePhoto',
    method: 'post',
    data
  })
}

export function deletePhoto(data) {
  return request({
    url: '/photo/addPhoto',
    method: 'post',
    data
  })
}

