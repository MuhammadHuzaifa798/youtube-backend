import mongoose,{ Schema } from "mongoose";


const playlistSchema = new Schema(
    {
        name : {
            type : string ,
            require : true
        },
        description : {
            type : string,
            require : true
        },
        videos : {
            type : Schema.Types.ObjectId,
            ref :"Video"
        },
        owner: {
            type : Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {
        timestamps : true
    }
)