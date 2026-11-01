import mongoose, { type Document } from "mongoose";
export type UserRole = "patient" | "doctor" | "admin" | "superadmin";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    doctorId?: string;
    profilePhoto?: string;
    gender?: "Female" | "Male" | "Other";
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
    specialization?: string;
    qualifications?: string;
    yearsOfExperience?: number;
    medicalLicenseNumber?: string;
    department?: string;
    consultationFee?: number;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=User.d.ts.map