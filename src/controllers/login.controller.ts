import {logger} from "../logger";

import * as volUserModel from "../models/vol-user.model";
import * as authUtils from "../auth/auth-utils";
import {Request, Response, NextFunction} from "express";

// TODO: Organiser and Admin roles
// TODO: Validation
export function loginUser(req: Request, res: Response, next: NextFunction) {
  logger.debug(`In loginUser() in login.controller`);

  const email = req.body.email;
  const password = req.body.password;

  logger.info(`Trying to login user where email:${email} password:${password}`);

  volUserModel.selectVolUserByEmail(email)
      .then((volUser) => {
        if (authUtils.checkPassword(password, volUser.vol_password)) {
          logger.debug(`Username and password are OK!`);

          // Attach user object to session
          req.session.user = {
            id: volUser.vol_id,
            email: volUser.vol_email,
            role: "volunteer"
          };

          res.status(200).send();
        } else {
          throw new Error("Invalid username or password!");
        }
      })
      .catch((err) => {
        logger.debug(`ERR: ${err}`);
        logger.debug(`Invalid username or password!`);

        next({status: 401, msg: "Invalid username or password!"});
      });
}

// TODO: Error handling
// TODO: Validation
export function logoutUser(req: Request, res: Response, next: NextFunction) {
  logger.debug(`In logoutUser() in login.controller`);
  logger.info(`Logging out user: ${req.session.user}`);

  if (req.session.user) {
    req.session.destroy(() => {
      logger.debug("User session destroyed!");

      // req.session.user = null;
      res.clearCookie('connect.sid');
      res.status(200).send();
    });
  } else {
    logger.debug("User was not logged in!");

    next({status: 400, msg: "User not logged in!"});
  }
}