// Define decode without spread "..." syntax or you may encounter bugs
// Decode: "mongo model format" -> "app format"
// Encode: "app format" -> "mongo model format"
// Modify this file instead of mongo models

// WARNING: Modifying "encode" method can cause dataloss.
// If you want to modify "encode" method, make sure you NEVER initialize any data with it
// Initializing data with "encode" can cause fields to become overridden. Be careful!!!

const { GRADES } = require('../config')

const user = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => ({
    ...o,
    passwordHash: o.passwordHash ? o.passwordHash : undefined
  }),
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        username: o.username,
        passwordHash: o.passwordHash,
        isAdmin: o.isAdmin,
      }
    } catch (err) {
      throw new Error(`Failed to decode a user with id: "${o?.id}"`)
    }
  }
}

const event = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => ({
    ...o,
    grades: o.grades?.map(g => GRADES.indexOf(g.name) + 1),
    grades2: o.grades,
    limits: typeof o.limits === 'string' ? JSON.parse(o.limits) : o.limits,
    visits: process.env.NODE_ENV === 'test'
      ? o.visits
      : o?.visits?.map(v => v?.id ? v.id : v)
  }),
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        title: o.title,
        resourceids: o.resourceids,
        remoteVisit: o.remoteVisit,
        schoolVisit: o.schoolVisit === undefined ? false : o.schoolVisit,
        inPersonVisit: o.inPersonVisit,
        grades: o.grades2?.length ? o.grades2 : o.grades.map(g => ({
          name: GRADES[g - 1]
        })),
        remotePlatforms: o.remotePlatforms,
        otherRemotePlatformOption: o.otherRemotePlatformOption,
        start: o.start ? new Date(o.start).toISOString() : undefined,
        end: o.end ? new Date(o.end).toISOString() : undefined,
        desc: o.desc,
        tags: o.tags,
        visits: o.visits
          ? (process.env.NODE_ENV === 'test'
            ? o.visits
            : o.visits.map(v => v.toJSON()))
          : [],
        availableTimes: o.availableTimes,
        waitingTime: o.waitingTime,
        extras: o.extras,
        duration: o.duration,
        customForm: o.customForm,
        disabled: o.disabled,
        reserved: o.reserved,
        group: o.group,
        publishDate: o.publishDate,
        languages: o.languages,
        cancellationForm: o.cancellationForm,
        locked: o.reserved ? true : false,
        limits: typeof o.limits !== 'string' ? JSON.stringify(o.limits) : o.limits,
        closedDays: o.closedDays
      }
    } catch (err) {
      throw new Error(`Failed to decode an event with id: "${o?.id}"`)
    }
  }
}

const visit = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => ({
    ...o,
    teaching: o.teaching ? {
      ...o.teaching,
      payload: typeof o?.teaching.payload === 'string'
        ? JSON.parse(o?.teaching.payload) : o?.teaching.payload
    } : {
      type: o.remoteVisit ? 'remote' : 'inperson',
      location: o.remoteVisit ? o.remotePlatform : undefined, // for backwards compatibility
    }
  }),
  decode: o => {
    const remote = o.remoteVisit
    const type = o.teaching?.type ? {
      ...o.teaching,
      payload: typeof o?.teaching.payload !== 'string'
        ? JSON.stringify(o?.teaching.payload) : o?.teaching.payload,
    } : {
      type: remote ? 'remote' : 'inperson',
      location: o.remoteVisit ? o.remotePlatform : undefined, // for backwards compatibility
    }
    try {
      return {
        _id: o.id,
        id: o.id,
        event: o.event,
        clientName: o.clientName,
        schoolName: o.schoolName,
        schoolLocation: o.schoolLocation,
        clientEmail: o.clientEmail,
        clientPhone: o.clientPhone,
        grade: o.grade,
        gradeInfo: o.gradeInfo,
        participants: o.participants,
        extras: o.extras,
        status: o.cancellation !== undefined ? false : true,
        startTime: o.startTime,
        endTime: o.endTime,
        teaching: type,
        dataUseAgreement: o.dataUseAgreement,
        customFormData: o.customFormData ? JSON.stringify(o.customFormData) : null,
        language: o.language,
        cancellation: o.cancellation ? JSON.stringify(o.cancellation) : null,
        created: o.created ? new Date(o.created).toISOString() : null
      }
    } catch (err) {
      throw new Error(`Failed to decode a visit with id: "${o?.id}"`)
    }
  }
}

const group = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => o,
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        name: o.name,
        maxCount: o.maxCount,
        visitCount: o.visitCount,
        disabled: o.disabled,
        events: o.events
      }
    } catch (err) {
      throw new Error(`Failed to decode a group with id: "${o?.id}"`)
    }
  }
}

const form = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => o,
  decode: (o) => {
    try {
      return {
        _id: o.id,
        id: o.id,
        name: o.name,
        fields: o.fields,
      }
    } catch (err) {
      throw new Error(`Failed to decode a form with id: "${o?.id}"`)
    }
  }
}

const tag = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => o,
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        name: o.name
      }
    } catch (err) {
      throw new Error(`Failed to decode a tag with id: "${o?.id}"`)
    }
  }
}

const extra = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => ({
    ...o,
    _id: o.id
  }),
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        name: o.name,
        classes: o.classes,
        remoteLength: o.remoteLength,
        inPersonLength: o.inPersonLength,
      }
    } catch (err) {
      throw new Error(`Failed to decode an extra with id: "${o?.id}"`)
    }
  }
}

const email = {
  // WARNING: Never initialize ANY data with "encode" method
  // Doing so can lead to unwanted dataloss
  // grades: [] <-- this line in "encode" caused grades become overridden by empty list
  // Use "encode" ONLY if you have to, NEVER without a VALID reason.
  encode: o => o,
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        name: o.name,
        html: o.html,
        text: o.text,
        subject: o.subject,
        ad: o.ad,
        adSubject: o.adSubject,
        adText: o.adText,
      }
    } catch (err) {
      throw new Error(`Failed to decode an email with id: "${o?.id}"`)
    }
  }
}

module.exports = {
  user,
  group,
  tag,
  extra,
  form,
  event,
  visit,
  email
}
