import { z } from "zod";

// Base user fields shared between create/response/update shapes
export const baseUserSchema = z.object({
  email: z.email(),
  name: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
});

// Create input - extend base with password
export const userCreateSchema = baseUserSchema.extend({
  password: z.string().min(6),
});

export const userUpdateSchema = userCreateSchema.partial();

// Response shape aligned to Prisma `User` model
export const userResponseSchema = baseUserSchema.extend({
  id: z.uuid(),
  createdAt: z.string(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const usersResponseSchema = z.array(userResponseSchema);

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const UserSchemas = {
  baseUserSchema,
  userCreateSchema,
  userUpdateSchema,
  userResponseSchema,
  usersResponseSchema,
  loginSchema,
};

export default UserSchemas;
