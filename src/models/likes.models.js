import mongoose , {Schema} from "mongoose";


const LikeSchema = new Schema(
    {
        comment : {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        } ,
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        LikedBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        tweet : {
            type : Schema.Types.ObjectId,
            ref : "Tweet"
        }
    },
    {
        timestamps : true
    }
)