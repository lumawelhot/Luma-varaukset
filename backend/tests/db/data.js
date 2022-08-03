const visitTwoWeeksAhead = {
  clientEmail: 'olli.opettaja@alppilankoulu.fi',
  clientName: 'Olli Opettaja',
  clientPhone: '050 313131313',
  customFormData: null,
  dataUseAgreement: false,
  event: '1',
  extras: [],
  grade: '1st grade',
  inPersonVisit: true,
  language: 'fi',
  participants: 13,
  remoteVisit: false,
  schoolLocation: 'Alppila',
  schoolName: 'Alppilan koulu',
  token: '43bbd438-7362-4981-a05b-708c1107e4c1',
}

const validExtra = {
  name: 'A new extra',
  inPersonLength: 31,
  remoteLength: 13,
  classes: [1, 3, 4, 5]
}

const validForm = {
  fields: '[{"name":"This is a question?","type":"text","validation":{"required":true}}]',
  name: 'Test form',
}

module.exports = {
  validExtra,
  validForm,
  visitTwoWeeksAhead
}