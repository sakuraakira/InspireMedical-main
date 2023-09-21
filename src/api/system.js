import axios from 'axios'
import request from '@/utils/request'
import Cookies from 'js-cookie'

// create an axios instance
const service = axios.create({
  timeout: 5000 // request timeout
})

export function getVersion(params) {
  return service({
    url: `/version.json`,
    method: 'get',
    params
  })
}

export function getApiVersion() {
  return request({
    url: '/System/Version',
    method: 'get'
  })
}

export function getAllCondition(params) {
  return request({
    url: '/System/AllCondition',
    method: 'get',
    params,
    headers: Cookies.get('language') === 'zh' ? { Langua: 'TW' } : {}
  })
}
