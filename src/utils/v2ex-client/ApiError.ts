export default class ApiError<T = any> extends Error {
  code: string;
  data?: T;

  constructor(args: {
    code: string,
    message: string,
    data?: T,
  }) {
    super(args.message);
    this.code = args.code;
    this.data = args.data;
  }
}