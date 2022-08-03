import { t } from '../i18n'
import * as Yup from 'yup'

export const CreateUserValidation = () => Yup.object().shape({
  username: Yup.string().min(5, t('too-short')).required(t('fill-field')),
  password: Yup.string().min(8, t('too-short')).required(t('fill-field')),
  confirm: Yup.string().oneOf([Yup.ref('password'), null], t('password-not-match')).required(t('fill-field')),
  isAdmin: Yup.bool().required(t('fill-field'))
})

export const ModifyUserValidation = () => Yup.object().shape({
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

export const GroupValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  maxCount: Yup.number().min(1, t('too-small')).required(t('fill-field'))
})

export const VisitValidation = () => Yup.object().shape({
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
  startTime: Yup.date()
    .test((value, formik) => {
      const eventTimes = formik?.parent?.eventTimes
      if (eventTimes && eventTimes.start > value) {
        return formik.createError({
          message: t('invalid-start')
        })
      } else return true
    })
    .required()
    .typeError(t('invalid-time')),
  endTime: Yup.date()
    .test((value, formik) => {
      const eventTimes = formik?.parent?.eventTimes
      if (eventTimes && eventTimes.end < value) {
        return formik.createError({
          message: t('invalid-end')
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
})

export const ExtraValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  inPersonLength: Yup.number().min(1, t('too-small')).required(t('fill-field')),
  remoteLength: Yup.number().min(1, t('too-small')).required(t('fill-field')),
  classes: Yup.array().min(1)
})

export const EventValidation = () => Yup.object().shape({
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
  /* inPersonVisit: Yup.bool().when('remoteVisit', {
    is: remoteVisit => !remoteVisit,
    then: Yup.bool().oneOf([true], t('atleast-one-visittype'))
  }), */
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
    .test((value, formik) => {
      const end = formik?.parent?.end
      if (!end || end < value) {
        return formik.createError({
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
})

export const CustomFormValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  //question: Yup.string().required(t('fill-field')) -- not needed
})