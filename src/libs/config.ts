import mongoose from "mongoose";

export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = ':method :url :response-time [:status] \n'  // log information about incoming requests, including details like request method, URL, status code, response time, and more.

export const shapeaIntoMongooseObjectId = (target: any) => {
  return typeof target === 'string' ? new mongoose.Types.ObjectId(target) : target;
};
