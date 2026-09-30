import bcrypt from "bcrypt";

export const generateHash = async (
  plainText: string,
  salt = Number(process.env.SALT),
): Promise<string> => {
  return await bcrypt.hash(plainText, salt);
};

export const compareHash = async (
  plainTxt: string,
  cipherTxt: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainTxt, cipherTxt);
};
