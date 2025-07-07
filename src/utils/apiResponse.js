class ApiResponse{
    constructor(statuscode , data , message="success"){
         this.statuscode = statuscode
         this.data = data
         this.message = message
         this.success= statuscode<400
    }
}

//comment : the ApiResponse class is used to create a response object that can be sent back to the client. It contains the status code, data, message, and success status. The success status is determined by whether the status code is less than 400. The message defaults to "success" if not provided.

