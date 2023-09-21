import { getPatientChart, getPatientDetail, getPatientList, getQuestionnaire } from '@/api/patient'
import echarts from 'echarts'
import QuestionTemplate from '@/components/QuestionTemplate'
import { deepClone } from '@/utils'
import { downloadPatientFile, downloadQuestionnaireFile } from '@/api/file'
import { condition } from '@/constants/commonConstants'
import { ConditionOptions } from '@/definitions/options'

export default {
  name: 'manager',
  components: { QuestionTemplate },
  props: [],
  data() {
    return {
      ConditionOptions,
      tableDataOriginal: [],
      tableData: [],
      patientDetailDialogForm: {
        isLoading: false,
        isVisible: false,
        title: '',
        data: null,
        caregiver: []
      },
      surveyTableData: [],
      answerTableData: [],
      patientAnswerTableData: [],
      patientMemberTableData: [],
      chartDetailDialogForm: {
        isLoading: false,
        isVisible: false,
        title: '',
        data: null
      },
      chartResponseDialog: {
        isLoading: false,
        isVisible: false,
        title: '',
        data: null
      },
      page: 0,
      paging: {
        isLoading: false,
        totalElements: null,
        query: {
          pageSize: 20,
          pageNum: 0,
          condition: 0,
          up: false
        }
      },
      chart: {
        dom: null,
        title: '',
        className: 'chart',
        width: '100%',
        height: '500px',
        xAxisData: [],
        yAxisData: {
          name: '',
          data: [],
          max: 100,
          min: 0
        }
      }
    }
  },
  computed: {
    questionPreview() {
      this.chartResponseDialog.data
      return []
    }
  },
  created() {
    this.ConditionOptions = JSON.parse(sessionStorage.getItem(condition))
    this.handleSearch()
  },
  mounted() {
  },
  methods: {
    handleSearch() {
      this.page = 0
      this.paging.query.pageNum = this.page + 1
      this.getList()
    },
    parseSort() {
      return {
        Page: this.paging.query.pageNum - 1,
        Order: this.paging.query.condition,
        Up: this.paging.query.up
      }
    },
    getList() {
      this.paging.isLoading = true
      getPatientList(this.parseSort()).then(response => {
        this.paging.totalElements = Number(response.PatientCount)
        this.tableDataOriginal = response.PatientList
        this.tableData = response.PatientList
        this.paging.isLoading = false
      })
    },
    handleSizeChange(val) {
      this.paging.query.pageSize = val
      const start = (this.paging.query.pageNum - 1) * this.paging.query.pageSize
      const end = start + this.paging.query.pageSize
      this.tableData = this.tableDataOriginal.slice(start, end)
    },
    handleCurrentChange(val) {
      this.page = val
      this.paging.query.pageNum = this.page + 1
      this.getList()
    },
    onSortChange(column) {
      let data = 0
      switch (column.prop) {
        case 'Name':
          data = 0
          break
        case 'Phone':
          data = 1
          break
        case 'Condition':
          data = 2
          break
        case 'HasCaregiver':
          data = 3
          break
        case 'RequestCount':
          data = 4
          break
        case 'CurrrentSurvey':
          data = 5
          break
        case 'SurveyCount':
          data = 6
          break
        case 'LastRequestTime':
          data = 7
          break
        case 'CreatedTime':
          data = 8
          break
      }
      this.paging.query.condition = data
      this.paging.query.up = column.order === 'ascending'
      this.getList()
    },
    parseCondition(type) {
      return this.ConditionOptions.filter(item => item.id === type)[0].name
    },
    parseHasCaregiver(isHas) {
      return isHas ? 'patient.yes' : 'patient.no'
    },
    getCssStyle(cell) {
      const cssStyle = {}
      const label = cell.column.label
      if (label === 'HasCaregiver') {
        cssStyle.color = cell.row[label] ? 'rgb(40, 160, 57)' : 'rgb(233, 89, 89)'
      }
      return cssStyle
    },
    handlerPatientDetailDialog(row) {
      this.patientDetailDialogForm.isLoading = true
      this.patientDetailDialogForm.isVisible = true
      this.patientDetailDialogForm.title = '病患資訊'
      this.patientDetailDialogForm.data = row
      getPatientDetail({ PID: row.PID }).then(response => {
        this.answerTableData = response.Patient.Questionnaires
        this.patientAnswerTableData = deepClone(response.Patient.Questionnaires)
        this.patientMemberTableData = response.PatientMembers
        this.patientDetailDialogForm.isLoading = false
        if (response.PatientMembers) {
          response.PatientMembers.forEach(item => {
            item.isSelected = false
          })
        }
        this.patientDetailDialogForm.caregiver = response.PatientMembers
      })
    },
    handlerSurveyChartDialog(row) {
      this.chartDetailDialogForm.isLoading = true
      this.chartDetailDialogForm.isVisible = true
      this.chartDetailDialogForm.title = ''
      this.chartDetailDialogForm.data = row
      getPatientChart({ PID: row.PatientID, SurveyId: row.SurveyID }).then(response => {
        this.chartDetailDialogForm.title = 'patient.survey_chart'
        this.chart.title = response.title
        this.chart.xAxisData = response.xAxis
        this.chart.yAxisData.name = response.yAxis.name
        this.chart.yAxisData.data = response.yAxis.data
        this.chart.yAxisData.max = response.topY
        this.initChart()
        this.chartDetailDialogForm.isLoading = false
      })
    },
    initChart() {
      this.chart.dom = echarts.init(this.$refs.chart)
      this.chart.dom.setOption({
        backgroundColor: '#394056',
        // 標題列
        title: {
          text: this.chart.title,
          x: '20',
          top: '20',
          textStyle: {
            color: '#fff',
            fontSize: '22'
          },
          subtextStyle: {
            color: '#90979c',
            fontSize: '16'
          }
        },
        // 提視窗
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        // 圖表外框
        grid: {
          top: 150,
          left: '5%',
          right: '5%',
          bottom: 95,
          containLabel: true
        },
        // 圖例
        legend: {
          x: '5%',
          top: '10%',
          // top: 20,
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: ['Yes/No Score'],
          right: '4%',
          textStyle: {
            fontSize: 12,
            color: '#F1F1F3'
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          data: this.chart.xAxisData
        }],
        yAxis: [{
          type: 'value',
          name: '',
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            margin: 100,
            textStyle: {
              fontSize: 30
            }
          },
          splitLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          mix: this.chart.yAxisData.min,
          max: this.chart.yAxisData.max
        }],
        // 放大縮小
        dataZoom: [
          {
            show: true,
            height: 30,
            xAxisIndex: [
              0
            ],
            bottom: 30,
            start: 0,
            end: 100,
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '80%',
            handleStyle: {
              color: '#d3dee5'
            },
            textStyle: {
              color: '#fff'
            },
            borderColor: '#90979c'

          }, {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 35
          }],
        series: [
          {
            name: this.chart.yAxisData.name,
            type: 'line',
            stack: 'x',
            barMaxWidth: 35,
            barGap: '10%',
            // smooth: true,
            // symbol: 'circle',
            // symbolSize: 5,
            // showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(137, 189, 27, 0.3)'
                }, {
                  offset: 0.8,
                  color: 'rgba(137, 189, 27, 0)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: 'rgb(137,189,27)',
                borderWidth: 5
              }
            },
            data: this.chart.yAxisData.data
            // markPoint: {
            //   data: [
            //     { type: 'max', name: '最大值' },
            //     { type: 'min', name: '最小值' }
            //   ]
            // }
          }
        ]
      })
    },
    handlerSurveyResponseDialog(row) {
      this.chartResponseDialog.isLoading = true
      this.chartResponseDialog.title = ''
      getQuestionnaire({ QuestionnaireID: row.QuestionnaireID }).then(response => {
        this.chartResponseDialog.data = response
        this.chartResponseDialog.isVisible = true
        this.patientDetailDialogForm.isLoading = false
      })
    },
    handleCaregiver(row) {
      let isSame = false
      this.patientDetailDialogForm.caregiver.forEach(item => {
        if (item.isSelected && item.UID === row.UID) {
          isSame = true
        }
        item.isSelected = false
      })

      if (isSame) {
        row.isSelected = false
        this.answerTableData = deepClone(this.patientAnswerTableData)
      } else {
        row.isSelected = true
        const temp = this.patientMemberTableData.find(item => item.UID === row.UID).Questionnaires
        if (temp) {
          this.answerTableData = deepClone(temp)
        }
      }
    },
    handleResponseDialogBeforeClose() {
      this.chartResponseDialog.data = null
      this.chartResponseDialog.isVisible = false
    },
    handlerPatientDownload(pid) {
      downloadPatientFile({ PatientID: pid }).then(response => {
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)

        // 設定下載的檔名。這裡假設響應中有一個 `content-disposition` header
        // 如果伺服器沒有提供一個名稱，你也可以自己指定一個固定的檔名
        const contentDisposition = response.headers['content-disposition']
        let fileName = 'downloaded-file' // 預設名稱
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename=([^;]+);/)
          if (fileNameMatch.length > 1) {
            fileName = fileNameMatch[1]
          }
        }
        link.setAttribute('download', fileName)

        document.body.appendChild(link) // 為了Firefox，我們需要將鏈接附加到 DOM
        link.click()
        document.body.removeChild(link)
      })
    },
    handlerQuestionnaireDownload() {
      downloadQuestionnaireFile({ PatientID: 6640 }).then(response => {
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)

        // 設定下載的檔名。這裡假設響應中有一個 `content-disposition` header
        // 如果伺服器沒有提供一個名稱，你也可以自己指定一個固定的檔名
        const contentDisposition = response.headers['content-disposition']
        let fileName = 'downloaded-file' // 預設名稱
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
          if (fileNameMatch.length > 1) {
            fileName = fileNameMatch[1]
          }
        }
        link.setAttribute('download', fileName)

        document.body.appendChild(link) // 為了Firefox，我們需要將鏈接附加到 DOM
        link.click()
        document.body.removeChild(link)
      })
    }
  }
}

