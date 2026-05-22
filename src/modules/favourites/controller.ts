import { type IAuthRequest } from "@/routes/index";
import { throwErrorOnValidation } from "@/utils/error";
import Service from "./service";

const list = async (req: IAuthRequest) => {
  return await Service.list(req.user.id);
};

const add = async (req: IAuthRequest) => {
  const businessId = Number(req.params.businessId);
  if (isNaN(businessId)) throwErrorOnValidation("Invalid business ID");
  return await Service.add(req.user.id, businessId);
};

const remove = async (req: IAuthRequest) => {
  const businessId = Number(req.params.businessId);
  if (isNaN(businessId)) throwErrorOnValidation("Invalid business ID");
  return await Service.remove(req.user.id, businessId);
};

export default { list, add, remove };
