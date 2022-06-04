import { t } from '../i18n'
import * as Yup from 'yup'
import { EVENT_MIN_LENGTH, EVENT_MIN_PARTICIPANTS, EXTRA_MIN_INPERSON_LENGTH, EXTRA_MIN_REMOTE_LENGTH } from '../config'

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

export const userValidateModify = () => {

}

export const loginValidate = () => {

}

export const groupValidate = () => {

}

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
  clientPhone: Yup.string()
    .required(t('fill-field')),
  grade: Yup.string()
    .required(t('fill-field')),
  participants: Yup.number()
    .min(EVENT_MIN_PARTICIPANTS,
      `${t('valid-atleast')} ${EVENT_MIN_PARTICIPANTS} ${EVENT_MIN_LENGTH > 1 ? t('valid-participants') : t('valid-participant')}`
    )
    .required(t('fill-field')),
  privacyPolicy: Yup.bool()
    .isTrue(),
  remoteVisitGuidelines: Yup.bool()
    .isTrue()
})

export const ExtraValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  inPersonLength: Yup.number().min(EXTRA_MIN_INPERSON_LENGTH).required(t('fill-field')),
  remoteLength: Yup.number().min(EXTRA_MIN_REMOTE_LENGTH).required(t('fill-field')),
  classes: Yup.array().min(1)
})

export const EventValidation = () => Yup.object().shape({
  title: Yup.string()
    .min(5, t('too-short'))
    .required(t('fill-field')),
  duration: Yup.number()
    .min(EVENT_MIN_LENGTH)
    .required(t('fill-field')),
  remoteVisit: Yup.bool().when('inPersonVisit', {
    is: inPersonVisit => !inPersonVisit,
    then: Yup.bool().oneOf([true], t('atleast-one-visittype'))
  }),
  inPersonVisit: Yup.bool().when('removeVisit', {
    is: remoteVisit => !remoteVisit,
    then: Yup.bool().oneOf([true], t('atleast-one-visittype'))
  }),
  languages: Yup.array().min(1, t('atleast-one-language')),
  grades: Yup.array().min(1, t('atleast-one-grade')),
  resourceids: Yup.array().min(1, t('atleast-one-resourceid')),
  waitingTime: Yup.number()
    .min(0)
    .required(t('fill-field'))
})

export const CustomFormValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  //question: Yup.string().required(t('fill-field')) -- not needed
})