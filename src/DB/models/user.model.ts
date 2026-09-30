import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enums/user.enum";
import { HydratedDocument } from "mongoose";
import { generateHash } from "../../common/security/hash";

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret: Record<string, unknown>) {
      delete ret.password;
      delete ret.confirmEmailOTP;
      delete ret.otpExpiresAt;

      return ret;
    },
  },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  lastName: string;

  // virtual
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
  })
  confirmEmail: Date;

  @Prop({
    type: String,
  })
  confirmEmailOTP: string | undefined;

  @Prop({
    type: Date,
  })
  otpExpiresAt: Date | undefined;

  @Prop({
    type: String,
    enum: Object.values(ProviderEnum),
    default: ProviderEnum.System,
  })
  provider: string;

  @Prop({
    type: String,
    required: function (this: any) {
      return this.provider === ProviderEnum.System;
    },
  })
  password: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      message: "{VALUE} is not a valid gender",
    },
    default: GenderEnum.Male,
    required: function (this: any) {
      return this.provider === ProviderEnum.System;
    },
  })
  gender: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(RoleEnum),
      message: "${VALUE} is not a valid role",
    },
    default: RoleEnum.User,
  })
  role: string;

  @Prop({ type: String })
  profilePic: string;

  // @Prop([{ type: String }])
  @Prop({ type: [String] })
  coverPic: [string];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await generateHash(this.password);
});

userSchema
  .virtual("username")
  .get(function (this) {
    return this.firstName + " " + this.lastName;
  })
  .set(function (this, value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName;
    this.lastName = lastName;
  });

export const userModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);

export type HUserDocument = HydratedDocument<User>;
