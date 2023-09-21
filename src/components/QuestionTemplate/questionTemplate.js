
export default {
  name: 'question-template',
  components: { },
  props: {
    question: {
      require: true
    },
    preview: {
      default: true
    }
  },
  data() {
    return {
      data: '',
      isVideo: false,
      weightData: [],
      audio: {
        loop: 'none',
        playing: false
      },
      marks: {
        0: '0',
        100: {
          label: this.$createElement('strong', '100'),
          style: {
            marginLeft: '-50%',
            textAlign: 'end',
            width: '100%'
          }
        }
      },
      playerOptions: {
        playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
        autoplay: false, // 如果true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: '', // 这里的种类支持很多种：基本视频格式、直播、流媒体等，具体可以参看git网址项目
          src: '' // url地址
        }],
        poster: '../../static/images/test.jpg', // 你的封面地址
        // width: document.documentElement.clientWidth, //播放器宽度
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true // 全屏按钮
        }
      }
    }
  },
  computed: {
    randomMediaLink() {
      if (this.question && this.question.MediaLinks) {
        this.isVideo = this.checkVideoExtension(this.question.MediaLinks[0])
        return this.question.MediaLinks[0]
      }
      return ''
    },
    weightScore() {
      let totalScore = 100
      for (const score of this.weightData) {
        totalScore -= score
      }
      return totalScore
    },
    choices() {
      let choiceData = this.question.Choices
      if (!this.preview) {
        switch (this.question.AnswerType) {
          case 3:
          case 7:
            choiceData = this.question.MultipleChoose
            break
        }
      }

      return choiceData
    },
    correct() {
      if (this.question.CorrectAnswer) {
        // eslint-disable-next-line eqeqeq
        return this.question.Answer == this.question.CorrectAnswer
      }
      return undefined
    },
    audioFile() {
      // return {
      //   title: '',
      //   artist: '',
      //   src: this.question.Answer,
      //   pic: '/images/squirrel.svg'
      // }
      return {
        name: '',
        artist: '',
        url: this.question.Answer
        // cover: 'https://p1.music.126.net/5zs7IvmLv7KahY3BFzUmrg==/109951163635241613.jpg?param=300y300', // prettier-ignore
        // lrc: 'https://cdn.moefe.org/music/lrc/thing.lrc'
      }
    },
    correctAnswer() {
      let data = this.question.CorrectAnswer
      switch (this.question.AnswerType) {
        case 1:
          data = this.question.CorrectAnswer === 1 ? 'Yes' : 'No'
          break
        case 3:
          data = this.question.MultipleChoose.filter(item => item.ChoiceID === Number(this.question.CorrectAnswer))[0].AnswerText
          break
      }
      return data
    }
  },
  mounted() {
    if (this.question.Answer) {
      if (this.question.AnswerType === 7) {
        this.weightData = JSON.parse(this.question.Answer)
      }
    }
  },
  watch: {},
  methods: {
    handleSliderChanged(index, data) {
      // console.log(index, data)
      if (this.weightScore < 0) {
        this.weightData[index] = data - 1
      }
    },
    checkVideoExtension(url) {
      const extension = url.split('.').pop()
      const videoExtensions = ['mp4', 'avi', 'flv', 'mov', 'wmv', 'rm', 'rmvb', 'mkv']
      return videoExtensions.includes(extension)
    },
    switchAudioPlayStatus(isPlaying) {
      console.log(isPlaying)
      this.audio.playing = isPlaying
    },
    destory() {
      if (this.question.AnswerType === 5) {
        if (this.audio.playing) {
          this.$refs.AudioPlayer.pause()
        }
      }
    }
  }
}

