const generateOTP = (): string => {
  return Math.floor(Math.random() * 900000 + 100000).toString();
};

export default generateOTP;
