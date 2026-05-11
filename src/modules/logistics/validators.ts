import z from "zod"
import { dateSchema } from "@/utils/baseValidation"

const createVehicleValidation = z.object({
  vehicleName: z.string().nonempty(),
  driverName: z.string().optional(),
  driverNumber: z.string().min(10).max(15).default(`${Date.now()}`),
  capacity: z.number().nonnegative(),
  availablityStartTime: dateSchema,
  availablityEndTime: dateSchema,
})

const updateVehicleValidation = createVehicleValidation.partial();

const assignVehicleValidation = z.object({
  vehicleId: z.number().nonnegative(),
  invitationId: z.number().nonnegative(),
  fromTime: dateSchema.optional(),
  toTime: dateSchema.optional(),
  isDeparture: z.boolean().optional(),
  isArrival: z.boolean().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),

})

type CreateVehicleType = z.infer<typeof createVehicleValidation>
type AssignVehicleType = z.infer<typeof assignVehicleValidation>
type UpdateVehicleType = z.infer<typeof updateVehicleValidation>

export { createVehicleValidation, CreateVehicleType, assignVehicleValidation, AssignVehicleType, updateVehicleValidation, UpdateVehicleType }; 
