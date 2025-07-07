class ApiError extends Error {
    constructor(
        statuscode,
        message = "something went error",
        errors = [],
        stack = " "
    ){
        super(message)
        this.statuscode = statuscode,
        this.errors = errors
        this.success = false
        this.data = null
        this.message = message

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}