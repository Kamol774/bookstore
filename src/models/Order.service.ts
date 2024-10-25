import { Member } from "../libs/types/member";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import { shapeaIntoMongooseObjectId } from "../libs/config";
import Errors, { Message } from "../libs/errors";
import { HttpCode } from "../libs/errors";
import { ObjectId } from "mongoose"
import MemberService from "./Member.service";
import { OrderStatus } from "../libs/enum/order.enum";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
  }
  //                      quyida req-res => parametri bor deyiladi
  public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
    const memberId = shapeaIntoMongooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0); // array ning iteration methodi
    const delivery = amount < 100 ? 5 : 0;
    console.log("amount:", amount, "delivery:", delivery);
    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      })

      const orderId = newOrder._id
      console.log("orderId:", orderId);

      //TODO: create order items
      await this.recordOrderItem(orderId, input);
      return newOrder;
    } catch (err) {
      console.log("Error, model.createOrder: ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }


  private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeaIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });
    console.log("promisedList:", promisedList);

    const OrderItemState = await Promise.all(promisedList);
    console.log("OrderItemState:", OrderItemState)
  }

  public async getMyOrders(member: Member, inquiry: OrderInquiry): Promise<Order[]> {
    const memberId = shapeaIntoMongooseObjectId(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };  // login bo'lgan userda mavjud orderlarni ko'rish uchun mantiq

    const result = await this.orderModel.aggregate([
      { $match: matches },
      { $sort: { updatedAt: -1 } },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit },
      {
        $lookup: {
          from: "orderItems",  // collection name
          localField: "_id",   // nimani olib kelish kk
          foreignField: "orderId",   // qaysi nom bilan izlash kk
          as: "orderItems",   // qaysi nom bilan saqlash kk
        }
      },
      {
        $lookup: {
          from: "products",  // collection name
          localField: "orderItems.productId",   // nimani olib kelish kk
          foreignField: "_id",   // qaysi nom bilan izlash kk
          as: "productData",   // qaysi nom bilan saqlash kk
        }
      }
    ]).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

    return result;
  }

  public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
    const memberId = shapeaIntoMongooseObjectId(member._id),
      orderId = shapeaIntoMongooseObjectId(input.orderId),
      orderStatus = input.orderStatus;

    const result = await this.orderModel.findOneAndUpdate(
      {
        memberId: memberId,
        _id: orderId,
      }, // filter
      { orderStatus: orderStatus }, // update
      { new: true } // options
    )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    // orderStatus PAUSE => PROCESS
    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.addUserPoint(member, 1);
    }
    return result;
  }
}

export default OrderService;


