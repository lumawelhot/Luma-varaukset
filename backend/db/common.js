// ----------------------------------- HELPERS
const replace = (a, b) => {
  for (const [key, value] of Object.entries(b)) {
    if (key === 'id' || value === undefined) continue
    a[key] = value
  }
  return a
}

const populate = (inst, models) => {
  if (!models) return inst
  for (const [model, options] of Object.entries(models)) {
    inst.populate(model, options)
  }
  return inst
}

const execPopulate = async (inst, models) => {
  if (!models) return inst
  const promises = []
  for (const [model, options] of Object.entries(models)) {
    promises.push(inst.populate(model, options))
  }
  await Promise.all(promises)
  return inst
}
// -------------------------------------------

// This class is a db access interface,
class Common {
  constructor(inst, encoder, session) {
    // Assuming we have a mongo instance
    this.inst = inst
    this.encode = encoder.encode
    this.decode = encoder.decode
    this.session = session
  }

  // TODO: Create general API for parsing args
  async find(args, expand) {
    const objects = await populate(this.inst.find(args), expand)
    return objects.map(o => this.decode(o))
  }

  async findOne(args, expand) {
    const object = await populate(this.inst.findOne(args), expand)
    return this.decode(object)
  }

  // Currently this is the only method you can safely use to get instance from transaction session.
  async findById(id, expand) {
    if (this.session) {
      const object = this.session.instanceById(id) // expand this ??
      if (object) return this.decode(object)
    }
    const object = await populate(this.inst.findById(id), expand)
    if (!object) return null
    return this.decode(object)
  }

  async findByIds(ids, expand) {
    return (await populate(this.inst.find({ _id: { $in: ids } }), expand)).
      map(o => this.decode(o))
  }

  async insert(args, expand) {
    delete args.id
    delete args._id // deleting id and _id is important or you can encounter bugs
    let object = new this.inst(this.encode(args))
    object = await execPopulate(object, expand)
    if (this.session) {
      this.session.insert(object)
      return this.decode(object)
    }
    return this.decode(await object.save())
  }

  // TODO: add updateMany version of this function,
  // so this function do not need to run multiple times
  async update(id, args, expand) {
    if (!id) return
    delete args.id
    delete args._id // deleting id and _id is important or you can encounter bugs
    const encoded = this.encode(args)
    let object = await this.inst.findById(id)
    if (!object) return
    object = replace(object, encoded)
    object = await execPopulate(object, expand)
    if (this.session) {
      this.session.insert(object)
      return this.decode(object)
    }
    return this.decode(await object.save())
  }

  async remove(ids) {
    if (!Array.isArray(ids)) ids = [ids]
    try {
      await this.inst.deleteMany({ _id: { $in: ids } })
      return ids
    } catch (err) {
      return []
    }
  }
}

module.exports = Common
