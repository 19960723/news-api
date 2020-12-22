export const resTest = async(ctx, next) => {
  ctx.body = {
    message: 'hello world',
    code: 200
  }
}
