import { getApiVersion, getVersion } from '@/api/system'

export default {
  name: 'system-info',
  components: {},
  props: [],
  data() {
    return {
      tableData: [
        {
          system: 'system.info.frontend',
          version: 'N/A',
          link: '/update_history.json'
        },
        {
          system: 'system.info.backend',
          version: 'N/A',
          link: null
        }
      ],
      paging: {
        isLoading: false,
        totalElements: null,
        query: {
          pageSize: 20,
          pageNum: 0,
          condition: 0,
          up: false
        }
      }
    }
  },
  computed: {},
  created() {
    this.getCurrentVersion()
  },
  mounted() {
  },
  methods: {
    getCurrentVersion() {
      getVersion().then(response => {
        this.tableData[0].version = response.data.version
      })

      getApiVersion().then(response => {
        this.tableData[1].version = response.Ver
      })
    }
  }
}

