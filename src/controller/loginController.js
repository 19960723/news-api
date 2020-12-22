export const Login = async(ctx, next) => {
  ctx.body = {
    message: 'login',
    code: 200
  }
}
export const Register = async(ctx, next) => {
  ctx.body = {
    message: 'register',
    code: 200
  }
}
