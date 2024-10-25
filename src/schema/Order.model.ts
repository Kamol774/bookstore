import mongoose, { Schema } from "mongoose";

const orderScheme = new Schema({
  orderTotal: {
    type: Number,
    required: true
  },
  orderDelivery: {
    type: Number,
    required: true
  },
  
  memberId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Member",
  },
},
  { timestamps: true, collection: "orders" }
);




export default mongoose.model("Order", orderScheme);