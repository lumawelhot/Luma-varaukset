import { t } from '../i18n'
import * as Yup from 'yup'

export const CreateUserValidation = Yup.object().shape({
  username: Yup.string().min(5, t('too-short')).required(t('fill-field')),
  password: Yup.string().min(8, t('too-short')).required(t('fill-field')),
  confirm: Yup.string().oneOf([Yup.ref('password'), null], t('password-not-match')).required(t('fill-field')),
  isAdmin: Yup.bool().required(t('fill-field'))
})

export const ModifyUserValidation = Yup.object().shape({
  username: Yup.string().min(5, t('too-short')).required(t('fill-field')),
  password: Yup.string().notRequired().test((value, { createError }) => {
    if (value && !Yup.string().min(8).isValidSync(value)) {
      return createError({
        message: t('too-short')
      })
    } else return true
  }),
  isAdmin: Yup.bool().required(t('fill-field'))
})

export const GroupValidation = Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  maxCount: Yup.number().min(1, t('too-small')).required(t('fill-field'))
})

export const VisitValidation = form => {
  const formFields = form?.fields ? Object.assign({}, ...Object.entries(form?.fields)
    .filter(e => e[1].validation.required)
    .map(e => {
      const o = {}
      o[`custom-${e[0]}`] = e[1].type === 'text'
        ? Yup.string().required() : e[1].type === 'checkbox'
          ? Yup.array().min(1, t('too-short')) : e[1].type === 'radio'
            ? Yup.string().required() : undefined
      return o
    })) : {}
  return Yup.object().shape({
    clientName: Yup.string()
      .min(5, t('too-short'))
      .required(t('fill-field')),
    schoolName: Yup.string()
      .min(5, t('too-short'))
      .required(t('fill-field')),
    schoolLocation: Yup.string()
      .required(t('fill-field')),
    clientEmail: Yup.string()
      .email()
      .required(t('fill-field')),
    verifyEmail: Yup.string()
      .email()
      .oneOf([Yup.ref('clientEmail'), null], t('email-not-match'))
      .required(t('fill-field')),
    remotePlatform: Yup.string()
      .when('visitType', {
        is: 'remote',
        then: Yup.string().required()
      }),
    startTime: Yup.date()
      .test((value, handler) => {
        const eventTimes = handler?.parent?.eventTimes
        const endTime = handler?.parent?.endTime
        if (eventTimes && (eventTimes.start > value || eventTimes.end < endTime)) {
          return handler.createError({
            message: t('invalid-start')
          })
        } else return true
      })
      .required()
      .typeError(t('invalid-time')),
    clientPhone: Yup.string()
      .required(t('fill-field')),
    grade: Yup.string()
      .required(t('fill-field')),
    participants: Yup.number()
      .min(1, t('too-small'))
      .required(t('fill-field')),
    privacyPolicy: Yup.bool()
      .isTrue(t('check-this-field')),
    remoteVisitGuidelines: Yup.bool()
      .isTrue(t('check-this-field')),
    ...formFields
  })
}

export const ExtraValidation = Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  inPersonLength: Yup.number().min(1, t('too-small')).required(t('fill-field')),
  remoteLength: Yup.number().min(1, t('too-small')).required(t('fill-field')),
  classes: Yup.array().min(1)
})

export const EventValidation = Yup.object().shape({
  title: Yup.string()
    .min(5, t('too-short'))
    .required(t('fill-field')),
  duration: Yup.number()
    .min(1, t('too-small'))
    .required(t('fill-field')),
  remoteVisit: Yup.bool().when('inPersonVisit', {
    is: inPersonVisit => !inPersonVisit,
    then: Yup.bool().oneOf([true], t('atleast-one-visittype'))
  }),
  inPersonVisit: Yup.bool().when('remoteVisit', {
    is: remoteVisit => !remoteVisit,
    then: Yup.bool().oneOf([true], t('atleast-one-visittype'))
  }),
  remotePlatforms: Yup.array()
    .when('remoteVisit', {
      is: true,
      then: Yup.array().min(1, t('atleast-one-remoteplatform'))
    }),
  languages: Yup.array().min(1, t('atleast-one-language')),
  grades: Yup.array().min(1, t('atleast-one-grade')),
  resourceids: Yup.array().min(1, t('atleast-one-resourceid')),
  waitingTime: Yup.number()
    .min(0, t('too-small'))
    .required(t('fill-field')),
  start: Yup.date()
    .test((value, handler) => {
      const end = handler?.parent?.end
      if (!end || end < value) {
        return handler.createError({
          message: t('end-after-start')
        })
      }
      return true
    })
    .required(t('fill-field'))
    .typeError(t('invalid-time')),
  end: Yup.date()
    .required(t('fill-field'))
    .typeError(t('invalid-time')),
}, [['inPersonVisit', 'remoteVisit']])

export const CustomFormValidation = Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
})