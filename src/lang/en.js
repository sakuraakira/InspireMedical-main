export default {
  layers: {
    loading: {
      msg: 'Loading...'
    },
    error: {
      title: 'Loading Failed'
    }
  },
  error: {
    usernameNotCorrect: 'Please enter the correct user name.',
    passwordNotCorrect: 'Please enter the correct password.'
  },
  system: {
    dashboard: 'Dashboard',
    info: {
      title: 'Info',
      system: 'System',
      version: 'Version',
      frontend: 'Admin',
      backend: 'Api'
    },
    username: 'Username',
    password: 'Password',
    login: 'Login',
    title: 'SymptomSquirrel',
    search: 'Search',
    searchPlaceHolder: 'Search',
    create: 'Create',
    cancel: 'Cancel',
    delete: 'Delete',
    logged: {
      title: 'Confirm logout',
      content: 'You have been logged out, you can cancel to stay on this page, or log in again',
      confirm: 'Re-Login'
    },
    logout: 'Log Out',
    changePassword: {
      title: 'Change Password',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Check Password',
      oldPasswordPlaceHolder: 'Please Input Old Password',
      newPasswordPlaceHolder: 'Please Input New Password',
      confirmPasswordPlaceHolder: 'Please Input New Password Again',
      success: 'Success Change'
    }
  },
  dashboard: {
    btn: {
      play: 'Play',
      pip: 'PIP',
      back: 'Back',
      pause: 'Pause',
      fullscreen: 'Full Screen',
      exitFullscreen: 'Exit Full Screen'
    },
    settings: {
      autoplay: 'Auto Play',
      loop: 'Loop',
      speed: 'Speed'
    }
  },
  rules: {
    required: 'Required',
    eightToTwentyLength: 'The password length should be between 8 and 20 characters.'
  },
  table: {
    loading: 'Give More Time',
    confirm: 'Confirm'
  },
  symptom: {
    dementia: 'Dementia',
    parkinson: 'Parkinson',
    migraine: 'Migraine'
  },
  role: {
    patient: 'Patient',
    caregiver: 'Caregiver',
    nurse: 'Nurse'
  },
  patient: {
    pid: 'UID',
    management: 'PatientManagement',
    title: 'Patient',
    patient_name: 'Patient Name',
    phone: 'Phone',
    condition: 'Condition',
    has_caregiver: 'HasCaregiver',
    comment: 'Comment',
    chart: 'Chart',
    current_survey: 'Current Survey',
    response: 'Response',
    last_response: 'Last Response',
    created: 'Created',
    download: 'Download',
    yes: 'Yes',
    no: 'No',
    name: 'Name',
    survey_chart: 'Survey Chart',
    answer_questionnaire: {
      submit_time: 'Submit Time',
      survey_name: 'Survey Name',
      condition: 'Condition',
      respondent: 'Respondent',
      score: 'Score',
      download: 'Download'
    }
  },
  question: {
    title: 'Question',
    edit_title: 'Edit Question',
    create_title: 'Add Question',
    topic: 'Topics',
    image: 'Image',
    answer_type: 'Answer Type',
    correct_answer: 'Correct Answer',
    choose: 'Choose',
    image_background: 'Image Set As Background',
    image_background_tooltip: 'Display image as background of the drawing area, for respondent to draw on',
    upload_image: 'Upload Image',
    delete_image: 'Delete Image',
    condition_placeholder: 'Please Choose Condition',
    respondent_placeholder: 'Please Choose Respondent',
    topic_placeholder: 'Add Topics To This Question',
    answer_type_placeholder: 'Please Choose Answer Type'
  },
  survey: {
    management: 'SurveyManagement',
    title: 'Survey',
    edit_title: 'Edit Survey',
    create_title: 'Add Survey',
    survey_name: 'Survey Name',
    description: 'Description',
    created: 'Created By',
    condition: 'Condition',
    respondent: 'Respondent',
    questions: 'Questions',
    create_time: 'Created',
    update_time: 'Modified',
    prescriptions: 'Prescription',
    default: 'Default',
    question: 'Question',
    currently_use: 'Currently Use',
    one_question_page_survey: 'One Question Page Survey',
    description_placeholder: 'Please Input Description',
    answer_type: {
      title: 'Answer Type',
      yesno: 'Yes/No',
      number: 'Number',
      multiple: 'Multiple Choice',
      drawing: 'Drawing',
      audio: 'Audio',
      video: 'Video',
      weighted: 'Weighted'
    },
    question_source: 'Available',
    question_target: 'Include',
    schedule: {
      title: 'Schedule',
      one_of_month: '1x/month',
      two_of_month: '2x/month',
      one_of_week: '1x/week',
      two_of_week: '2x/week',
      one_of_day: '1x/day',
      ad_hoc: 'ad hoc'
    }
  }
}
