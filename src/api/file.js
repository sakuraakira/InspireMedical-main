import request from '@/utils/request'

const apiPrefix = '/file'

export function downloadPatientFile(params) {
  return request({
    url: `${apiPrefix}/patientAudio`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function downloadQuestionnaireFile(params) {
  return request({
    url: `${apiPrefix}/questionnaireAudio`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}
