import mongoose , {Schema} from "mongoose";


const SubscriptionSchema = new Schema(
    {
        Subscriber : {
            typeof : Schema.Types.ObjectId,
            ref : "User"
        },
        Channel : {
            typeof : Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {
        timestamps : true
    }
)

export const Subscription = mongoose.model("Subscription",SubscriptionSchema)