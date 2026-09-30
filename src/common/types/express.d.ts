// Global Express Types
// Make req.user & req.decoded available everywhere after authentication

import { HUserDocument } from "../../DB/models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
    }
  }
}

export {};
