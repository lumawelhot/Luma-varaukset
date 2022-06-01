import { t } from '../i18n'
import * as Yup from 'yup'
import { EVENT_MIN_LENGTH } from '../config'

export const userValidate = () => {

}

export const userValidateModify = () => {

}

export const loginValidate = () => {

}

export const groupValidate = () => {

}

export const visitValidate = () => {

}

export const ExtraValidation = () => Yup.object().shape({
  name: Yup.string().required(t('fill-field')),
  inPersonLength: Yup.number().min(1).required(t('fill-field')),
  removeLength: Yup.number().min(1).required(t('fill-field')),
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
  question: Yup.string().required(t('fill-field'))
})