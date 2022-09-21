// Define decode without spread "..." syntax or you may encounter bugs
// Decode: "mongo model format" -> "app format"
// Encode: "app format" -> "mongo model format"
// Modify this file instead of mongo models

const user = {
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
  encode: o => o,
  decode: o => {
    try {
      return {
        _id: o.id,
        id: o.id,
        title: o.title,
        resourceids: o.resourceids,
        remoteVisit: o.remoteVisit,
        inPersonVisit: o.inPersonVisit,
        grades: o.grades,
        remotePlatforms: o.remotePlatforms,
        otherRemotePlatformOption: o.otherRemotePlatformOption,
        start: o.start ? new Date(o.start).toISOString() : undefined,
        end: o.end ? new Date(o.end).toISOString() : undefined,
        desc: o.desc,
        tags: o.tags,
        visits: o.visits ? o.visits : [],
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
        locked: o.reserved ? true : false
      }
    } catch (err) {
      throw new Error(`Failed to decode an event with id: "${o?.id}"`)
    }
  }
}

const visit = {
  encode: o => o,
  decode: o => {
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
        participants: o.participants,
        extras: o.extras,
        status: o.cancellation ? false : true,
        startTime: o.startTime,
        endTime: o.endTime,
        inPersonVisit: o.inPersonVisit,
        remoteVisit: o.remoteVisit,
        dataUseAgreement: o.dataUseAgreement,
        remotePlatform: o.remotePlatform,
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
