import joi from "joi"
import z from "zod"
import { imageValidationExtensions } from "@/constant"
const imageValidation = joi.object({
  base64: joi.string().max(14000000).required(),
  extension: joi.string().valid(...imageValidationExtensions).required()
}).optional();

export const dateSchema = z.union([
  z.date(),
  z.string().datetime(),
  z.string().date(),
]).transform((val) => val instanceof Date ? val : new Date(val))
  .nullable();  // if you need null support
export default imageValidation;


