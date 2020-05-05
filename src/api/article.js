import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vlog/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vlog/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vlog/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vlog/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vlog/update',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/vlog/delete',
    method: 'post',
    data
  })
}
