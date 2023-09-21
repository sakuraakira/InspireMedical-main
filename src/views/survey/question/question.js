import {
  createQuestion,
  getQuestionAnswerType,
  getQuestionDetail,
  getQuestionList,
  getQuestionTopics, updateQuestion
} from '@/api/survey'
import { Rules } from '@/definitions/fieldCheck'
import { createUniqueString, deepClone } from '@/utils'
import { ConditionOptions, RespondentOptions } from '@/definitions/options'
import { getToken } from '@/utils/auth'
import store from '@/store'
import QuestionTemplate from '@/components/QuestionTemplate'
import { condition } from '@/constants/commonConstants'

export default {
  name: 'question',
  components: { QuestionTemplate },
  props: [],
  data() {
    return {
      ConditionOptions,
      RespondentOptions,
      TopicOptions: [],
      AnswerOptions: [],
      tableColumnProp: [],
      tableDataOriginal: [],
      tableData: [],
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
      showDeleteIcon: false,
      editDialog: {
        title: '',
        isVisible: false,
        isEdit: false,
        isShowCorrectAnswer: false,
        multipleAnswer: '',
        defaultChoice: {
          AnswerText: '',
          ChoiceID: 0,
          Level: 0,
          MediaLink: '',
          QuestionID: 0,
          isNewer: true
        },
        defaultData: {
          QuestionID: 0,
          Version: 0,
          QuestionText: '',
          RespondentType: '',
          ConditionID: '',
          AnswerType: 1,
          MediaLink: '',
          MediaLinks: [],
          MediaFileUrls: [],
          IsBackground: false,
          UserC: 0,
          TimeC: null,
          UserU: 0,
          TimeU: null,
          NameC: '0',
          Choices: [],
          Topics: [],
          TopicIds: [],
          UsingSurveyCount: 0,
          PrescribedPatientCount: 0,
          isAvailable: false,
          CorrectAnswer: null
        },
        data: {},
        rules: {
          ConditionID: [...Rules.requiredChange, ...Rules.requiredBlur],
          RespondentType: [...Rules.requiredChange, ...Rules.requiredBlur],
          QuestionText: [...Rules.requiredChange, ...Rules.requiredBlur]
        }
      },
      previewDialog: {
        isVisible: false,
        data: ''
      },
      previewVideoDialog: {
        isVisible: false,
        data: ''
      }
    }
  },
  computed: {
    serverHeader() {
      return { Token: store.getters.token ? getToken() : '0000' }
    },
    correctAnswerVisible() {
      return this.editDialog.data.AnswerType < 3
    }
  },
  created() {
    this.ConditionOptions = JSON.parse(sessionStorage.getItem(condition))
    this.handleSearch()
    this.init()
  },
  mounted() {
  },
  methods: {
    init() {
      getQuestionTopics().then(response => {
        this.TopicOptions = []
        for (const data of response.TopicList) {
          this.TopicOptions.push({ id: data.TopicID, name: data.Topic, data: data })
        }
      })
      getQuestionAnswerType().then(response => {
        this.AnswerOptions = []
        for (const data of response) {
          this.AnswerOptions.push({
            id: data.AnswerTypeID,
            name: this.$t(`survey.answer_type.${data.AnswerType.replace('/', '')}`),
            response: data
          })
        }
      })
    },
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
      getQuestionList(this.parseSort()).then(response => {
        this.paging.totalElements = Number(response.QuestionCount)
        this.tableDataOriginal = response.QuestionList
        this.tableData = response.QuestionList
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
        case 'SurveyName':
          data = 0
          break
        case 'Condition':
          data = 1
          break
        case 'AnswerType':
          data = 2
          break
        case 'Respondent':
          data = 3
          break
        case 'Questions':
          data = 4
          break
        case 'Created':
          data = 5
          break
        case 'Modified':
          data = 6
          break
        case 'Prescriptions':
          data = 7
          break
      }
      this.paging.query.condition = data
      this.paging.query.up = column.order === 'ascending'
      this.getList()
    },
    parseCondition(type) {
      return this.ConditionOptions.filter(item => item.id === type)[0].name
    },
    parseAnswerType(type) {
      switch (type) {
        case 1:
          return 'survey.answer_type.yesno'
        case 2:
          return 'survey.answer_type.number'
        case 3:
          return 'survey.answer_type.multiple'
        case 4:
          return 'survey.answer_type.drawing'
        case 5:
          return 'survey.answer_type.audio'
        case 6:
          return 'survey.answer_type.video'
        case 7:
          return 'survey.answer_type.weighted'
      }
      return type
    },
    parseRespondent(type) {
      switch (type) {
        case 1:
          return 'role.patient'
        case 2:
          return 'role.caregiver'
      }
    },
    getCssStyle(cell) {
      const cssStyle = {}
      const label = cell.column.label
      if (label === 'HasCaregiver') {
        cssStyle.color = cell.row[label] ? 'rgb(40, 160, 57)' : 'rgb(233, 89, 89)'
      }
      return cssStyle
    },
    handleEditDialogShow(row) {
      this.editDialog.title = `question.${!row ? 'create' : 'edit'}_title`
      this.editDialog.data = !row ? deepClone(this.editDialog.defaultData) : row
      this.editDialog.isEdit = !!row
      this.editDialog.isShowCorrectAnswer = false
      this.editDialog.isVisible = true
      if (row) {
        getQuestionDetail({ QuestionID: row.QuestionID }).then(response => {
          this.editDialog.isShowCorrectAnswer = !!response.CorrectAnswer
          this.editDialog.data = response
          this.editDialog.data.IsBackground = response.IsBackground === true ? 1 : 0
          this.editDialog.data.MediaFileUrls = this.mediaLink(this.editDialog.data.MediaLinks)
        })
      }
      // this.$refs.fileDescription.fileList = this.editDialog.data.MediaFileUrls
    },
    handlePreview(event) {
      if (event.isVideo) {
        this.previewVideoDialog.isVisible = true
        this.previewVideoDialog.data = event.name
      } else {
        this.previewDialog.isVisible = true
        this.previewDialog.data = event.url
      }
    },
    handleUploadSuccess(response, file, fileList) {
      this.editDialog.data.MediaLinks = []
      console.log(fileList)
      for (const responseElement of fileList) {
        if (responseElement.response) {
          this.editDialog.data.MediaLinks.push(responseElement.response.JsonData.MediaLink)
          if (this.checkVideoExtension(responseElement.response.JsonData.MediaLink)) {
            this.createThumbnail(response.JsonData.MediaLink, thumbnail => {
              responseElement.url = thumbnail
            })
          } else {
            responseElement.url = responseElement.response.JsonData.MediaLink
          }
        } else {
          this.editDialog.data.MediaLinks.push(responseElement.name)
        }
      }
      this.editDialog.data.MediaFileUrls = fileList
    },
    createThumbnail(videoUrl) {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      // 设置视频源
      video.src = videoUrl
      const that = this

      // 当视频元数据加载完成后
      video.addEventListener('loadedmetadata', function() {
        // 在canvas上绘制视频的第一帧
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

        // 获取canvas上的图像数据作为缩略图
        const thumbnailUrl = canvas.toDataURL('image/png')

        // 调用回调函数并传递缩略图
        for (const mediaFileItem of that.editDialog.data.MediaFileUrls) {
          if (mediaFileItem.name === videoUrl) {
            mediaFileItem.url = thumbnailUrl
          }
        }
      })
    },
    handleRemoveSuccess(file, fileList) {
      const list = []
      for (const fileListElement of fileList) {
        list.push(fileListElement.url)
      }
      this.editDialog.data.MediaLinks = list
    },
    handleUploadMultipleChoiceSuccess(response, file, fileList, row) {
      row.MediaLink = response.JsonData.MediaLink
    },
    mediaLink(data) {
      const fileList = []
      for (const url of data) {
        const isVideo = this.checkVideoExtension(url)
        const urlResult = url

        if (isVideo) {
          this.createThumbnail(url)
        }
        fileList.push({ name: url, url: urlResult, isVideo: isVideo })
      }
      return fileList
    },
    checkVideoExtension(url) {
      const extension = url.split('.').pop()
      const videoExtensions = ['mp4', 'avi', 'flv', 'mov', 'wmv', 'rm', 'rmvb', 'mkv']
      return videoExtensions.includes(extension)
    },
    handleAddedMultipleChoice() {
      const data = deepClone(this.editDialog.defaultChoice)
      data.ChoiceID = createUniqueString()
      data.AnswerText = this.editDialog.multipleAnswer
      this.editDialog.multipleAnswer = ''
      this.editDialog.data.Choices.push(data)
    },
    handleDeleteMultipleChoice(index) {
      if (this.editDialog.data.Choices.length > 0) {
        this.editDialog.data.Choices.splice(index, 1)
      }
    },
    handleDeleteMultipleChoiceImage(row) {
      row.MediaLink = ''
    },
    createQuestion() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.editDialog.data.TimeC = new Date()
          this.editDialog.data.TimeU = new Date()
          if (this.editDialog.data.isShowCorrectAnswer && !this.editDialog.data.CorrectAnswer) {
            this.$message({
              message: this.$t('question.notice_correct_answer_empty'),
              type: 'warning'
            })
            return
          }
          if (this.convertQuestionData()) {
            createQuestion(this.editDialog.data).then(() => {
              this.getList()
            })
            this.editDialog.isVisible = false
            this.previewDialog.isVisible = false
          }
        }
      })
    },
    updateQuestion() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.editDialog.data.TimeC = new Date()
          this.editDialog.data.TimeU = new Date()

          if (this.convertQuestionData()) {
            updateQuestion(this.editDialog.data).then(() => {
              this.getList()
            })
            this.editDialog.isVisible = false
            this.previewDialog.isVisible = false
          }
        }
      })
    },
    convertQuestionData() {
      const newChoice = []
      for (const choice of this.editDialog.data.Choices) {
        const item = {
          AnswerText: choice.AnswerText,
          ChoiceID: choice.ChoiceID,
          Level: choice.Level,
          MediaLink: choice.MediaLink,
          QuestionID: choice.QuestionID
        }
        if (choice.isNewer) {
          item.ChoiceID = 0
        }
        newChoice.push(item)
      }
      this.editDialog.data.Choices = newChoice
      this.editDialog.data.IsBackground = this.editDialog.data.IsBackground === 1
      if (this.editDialog.isShowCorrectAnswer) {
        if (this.editDialog.data.CorrectAnswer) {
          this.editDialog.data.CorrectAnswer = this.editDialog.data.CorrectAnswer.toString()
        } else {
          this.$message({
            message: this.$t('question.notice_correct_answer_empty'),
            type: 'warning'
          })
          return false
        }
      } else {
        this.editDialog.data.CorrectAnswer = null
      }
      return true
    },
    topicOnChanged(ids) {
      this.editDialog.data.Topics = []
      for (const id of ids) {
        const index = this.TopicOptions.findIndex((item) => {
          return item.id === id
        })
        this.editDialog.data.Topics.push(this.TopicOptions[index].data)
      }
    },
    handleChoiceTableMove(isTop, index) {
      const newIndex = isTop ? index - 1 : index + 1
      if (newIndex >= 0) {
        const currRow = this.editDialog.data.Choices.splice(index, 1)[0]
        this.editDialog.data.Choices.splice(newIndex, 0, currRow)
      }
    }
  }
}

