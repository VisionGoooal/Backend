/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request, NextFunction } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type Payload = {
  _id: string;
};

const generateTokens = (id:string): { accessToken: string, refreshToken: string }|null => {
  const random = Math.floor(Math.random() * 1000000);
  if (!process.env.JWT_SECRET) {
    return null;
  }
  const accessToken = jwt.sign({ _id: id, random:random }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ _id: id, random:random }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}


const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
}
}

const login = async (req: Request, res: Response) => {
  console.log("in login");
  
  const {email,password} = req.body;
  console.log(email);
  console.log(password);
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("wrong email or password1");
      res.status(400).send("wrong email or password1");
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("wrong email or password2");
      res.status(400).send("wrong email or password2");
      return;
    }
    console.log(user._id);
    
    const tokens = generateTokens(user._id);
    console.log(tokens?.accessToken);
    
    if(!tokens){
        res.status(500).send('server error');
        return;
    }

    if(user.refreshToken==null){
        user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({ accessToken: tokens.accessToken, _id: user._id, email: user.email, refreshToken: tokens.refreshToken });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
  }  



const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) {
    res.status(400).send("bad request");
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(500).send("server error");
    return;
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err:any, payload:any) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }
    try{
    const user = await userModel.findById((payload as Payload)._id);
    if (!user) {
      res.status(404).send("user not found");
      return;
    }
    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
      res.status(401).send("Access Denied");
      user.refreshToken = [];
      await user.save();
      return;
    }
    const tokens = user.refreshToken.filter((t) => t !== refreshToken);
    user.refreshToken = tokens;
    await user.save();
    res.status(200).send("logged out");
    }catch(e){
        res.status(500).send(e);
      }
  });
};

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("bad request");
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(500).send("server error");
    return;
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err:any, payload:any) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }
    try{
    const user = await userModel.findById((payload as Payload)._id);
    if (!user) {
      res.status(404).send("user not found");
      return;
    }
    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
      res.status(401).send("Access Denied");
      user.refreshToken = [];
      await user.save();
      return;
    }
    const newTokens = generateTokens(user._id);
    if(!newTokens){
      user.refreshToken = [];
      await user.save();  
      res.status(500).send('server error');
      return;
  }
    user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
    user.refreshToken.push(newTokens.refreshToken);
    await user.save();
    res.status(200).send({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
    }catch(e){
        res.status(500).send(e);
    }

})}


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(500).send("server error");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
        res.status(401).send('Access Denied');
        return;
    }
    req.params.userId = (payload as Payload)._id;
    next();
});
};

export default { register, login, logout, refresh };
