import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enum/product.enum";


const productService = new ProductService();  // ProductService classdan instance olib productService variable ga tenglashtirib olyapmiz

const productController: T = {};

/** SPA *///////////////////////////////////////////////////////////////

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query; // distruction 
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit)
    };
    if (productCollection) inquiry.productCollection = productCollection as ProductCollection;
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry)

    res.status(HttpCode.OK).json(result)
  } catch (err) {
    console.log("Error getProducts", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params; // distruction 
    console.log("req.member==>", req.member)
    const memberId = req.member?._id ?? null,
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error getProduct:", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** SSR *///////////////////////////////////////////////////////////////

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();
    console.log("products:", data)

    res.render("products", { products: data }) // render ni 2-argumenti qanday nom bn nomlash: products deb nomladik
  } catch (err) {
    console.log("Error getAllProducts", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
  try {
    console.log('createNewProduct');
    console.log("req.body:", req.body);

    console.log('files');
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body; // kirib kelayotgan ma'lumotni data variable ga tenglayapmiz
    data.productImages = req.files?.map((ele) => {// map orqali iteration qilyapmiz
      return ele.path;
    });

    console.log("data:", data);
    await productService.createNewProduct(data);
    res.send(`<script> alert("Sucessfull creation !"); window.location.replace('/admin/product/all') </script>`);

  } catch (err) {
    console.log("Error,createNewProduct:", err);
    const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(`<script> alert("${message}"); window.location.replace('admin/product/all') </script>`);
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;
    console.log("id:", id);

    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;