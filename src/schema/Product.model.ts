import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductStatus,
} from "../libs/enum/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },
    
    productName: {
      type: String,
      required: true,
    },

    productAuthor: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productView: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

productSchema.index(
  { productName: 1, productSize: 1},
  { unique: true }
);
export default mongoose.model("Product", productSchema);
