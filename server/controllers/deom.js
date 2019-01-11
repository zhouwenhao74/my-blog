const { mysql } = require('../qcloud')

module.exports = async (ctx, next) => {
  const {id} = ctx.request.query
  console.log(ctx)
  await mysql.select('detail').from('Novel').where('id', id).then(res => {
    ctx.state.code = 0
    ctx.state.data = res
  }).catch(err => {
    ctx.state.code = -1
    throw new Error(err)
  })
}
