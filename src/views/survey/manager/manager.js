import { createSurvey, editSurvey, getAvailableQuestion, getSurveyDetail, getSurveyList } from '@/api/survey'
import { deepClone } from '@/utils'
import { Rules } from '@/definitions/fieldCheck'
import { ConditionOptions, RespondentOptions, ScheduleOptions } from '@/definitions/options'
import Sortable from 'sortablejs'
import QuestionTemplate from '@/components/QuestionTemplate'
import { isString } from '@/utils/validate'
import { condition } from '@/constants/commonConstants'

export default {
  name: 'manager',
  components: { QuestionTemplate },
  props: [],
  data() {
    return {
      ConditionOptions,
      RespondentOptions,
      ScheduleOptions,
      AnswerOptions: ['yesno', 'number', 'multiple', 'drawing', 'audio', 'video', 'weighted'],
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
          up: false,
          search: ''
        }
      },
      editDialog: {
        title: '',
        isVisible: false,
        isEdit: false,
        defaultData: {
          ConditionID: null,
          ConditionName: '',
          IsEnable: false,
          IsPageByPage: false,
          NameC: '',
          PrescribedPatientCount: 0,
          Questions: [],
          QuestionsCount: 0,
          RespondentName: '',
          RespondentType: null,
          SurveyDescription: '',
          SurveyID: 0,
          SurveyName: '',
          SurveySchedule: 0,
          TimeC: null,
          TimeU: null,
          UID: 0,
          UserC: 0,
          UserU: null
        },
        data: {},
        availableQuestion: [],
        rules: {
          ConditionID: [...Rules.requiredChange, ...Rules.requiredBlur],
          RespondentType: [...Rules.requiredChange, ...Rules.requiredBlur],
          SurveyName: [...Rules.requiredChange, ...Rules.requiredBlur],
          SurveySchedule: [...Rules.requiredChange, ...Rules.requiredBlur]
        }
      }
    }
  },
  computed: {
    availableQuestionData() {
      const questions = []
      for (const question of this.editDialog.availableQuestion) {
        questions.push({
          label: question.QuestionText,
          key: question.QuestionID,
          data: question
        })
      }
      return questions
    },
    questionPreview() {
      const list = []
      if (!this.editDialog.data || !this.editDialog.data.Questions) {
        return []
      }
      for (const questionKey of this.editDialog.data.Questions) {
        let key = questionKey
        if (isString(questionKey)) {
          key = questionKey.slice(0, questionKey.indexOf('_') > -1 ? questionKey.indexOf('_') : questionKey.length)
        }
        const questionItem = this.availableQuestionData.find(item => String(item.key) === String(key))
        if (questionItem) {
          list.push(questionItem.data)
        }
      }
      return list
    },
    includeQuestion() {
      const list = []
      for (const question of this.editDialog.data.Questions) {
        const questionStr = String(question)
        list.push(questionStr.slice(0, questionStr.indexOf('_') > 0 ? questionStr.indexOf('_') : questionStr.length))
      }
      return list
    }
  },
  created() {
    this.ConditionOptions = JSON.parse(sessionStorage.getItem(condition))
    this.handleSearch()
  },
  mounted() {
  },
  watch: {
    'editDialog.data.ConditionID': {
      handler: function(val) {
        if (this.editDialog.data.RespondentType && this.editDialog.data.RespondentType > 0) {
          if (val) {
            this.updateAvailableQuestion(val, this.editDialog.data.RespondentType)
          } else {
            this.editDialog.availableQuestion = []
          }
        }
      }
    },
    'editDialog.data.RespondentType': {
      handler: function(val) {
        if (this.editDialog.data.ConditionID && this.editDialog.data.ConditionID > 0) {
          if (val) {
            this.updateAvailableQuestion(this.editDialog.data.ConditionID, val)
          } else {
            this.editDialog.availableQuestion = []
          }
        }
      }
    }
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
        Up: this.paging.query.up,
        Key: this.paging.query.search
      }
    },
    getList() {
      this.paging.isLoading = true
      getSurveyList(this.parseSort()).then(response => {
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
        case 'CreatedBy':
          data = 1
          break
        case 'Condition':
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
        case 'Default':
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
      this.editDialog.title = `survey.${!row ? 'create' : 'edit'}_title`
      this.editDialog.data = !row ? deepClone(this.editDialog.defaultData) : row
      this.editDialog.availableQuestion = []
      this.editDialog.isEdit = !!row
      this.editDialog.isVisible = true
      if (row) {
        getSurveyDetail({ SurveyID: row.SurveyID }).then(response => {
          const list = []
          for (const question of response.Questions) {
            list.push(question.QuestionID)
          }
          response.Questions = list
          this.editDialog.data = response
          this.editDialog.data.IsPageByPage = response.IsPageByPage ? 1 : 0

          this.updateAvailableQuestion(this.editDialog.data.ConditionID, this.editDialog.data.RespondentType)
        })
      }
      this.$nextTick(() => {
        this.initTransferDragDrop()
      })
    },
    createSurvey() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.editDialog.data.IsPageByPage = this.editDialog.data.IsPageByPage === 1
          this.editDialog.data.Questions = this.includeQuestion
          createSurvey(this.editDialog.data).then(() => {
            this.getList()
          })
          this.editDialog.isVisible = false
        }
      })
    },
    updateSurvey() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.editDialog.data.IsPageByPage = this.editDialog.data.IsPageByPage === 1
          this.editDialog.data.Questions = this.includeQuestion
          editSurvey(this.editDialog.data).then(() => {
            this.getList()
          })
          this.editDialog.isVisible = false
        }
      })
    },
    updateAvailableQuestion(condition, respondent) {
      getAvailableQuestion({ Condition: condition, Respondent: respondent }).then((response) => {
        this.editDialog.availableQuestion = response.QuestionList
      })
    },
    initTransferDragDrop() {
      const transfer = this.$refs.transfer.$el
      const rightPanel = transfer.getElementsByClassName('el-transfer-panel')[1].getElementsByClassName('el-transfer-panel__body')[0]
      const rightEl = rightPanel.getElementsByClassName('el-transfer-panel__list')[0]
      Sortable.create(rightEl, {
        onEnd: (event) => {
          const { oldIndex, newIndex } = event
          if (oldIndex === newIndex) {
            return
          }

          // 先移除原來的元素
          const [removed] = this.editDialog.data.Questions.splice(oldIndex, 1)

          // 然後在新的位置插入
          this.editDialog.data.Questions.splice(newIndex, 0, removed)
        }
      })
    },
    handleQuestionFilter(query, item) {
      return item.data.QuestionText.indexOf(query) > -1
    }
  }
}

