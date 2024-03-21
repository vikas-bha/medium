import { Hono } from "hono";

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
import { signupInput, singinInput } from "@vikas__bhardwaj/common/dist/index";
export const userRouter = new Hono<
{
    Bindings :{
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}
>();



userRouter.post('/signin',async (c) => {
  
    const body = await c.req.json();

    const {success} = singinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message : "inputs not correct"
      })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
    const user = await prisma.user.findUnique({
      where :{
        email: body.email,
        password : body.password
      }
    })
  
    if(!user){
      c.status(403);
      return c.json({error: "user not found"})
    }
  
    const jwt = await sign({id:user.id}, c.env.JWT_SECRET)
    // return c.text('Hello Hono!')
    return c.json({
      message : "signed in successfully",
      jwt : jwt
    })
      
    } catch (error) {
      console.log(error);
      c.status(411);
      return c.text("Invalid");
      
    }
    
  })
  
  
  
  userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json()

    const {success} = signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message : "Input not correct"
      })
    }
  
    try {
      
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name : body.name
        }
      })
  
      const token = await sign({id:user.id}, c.env.JWT_SECRET);
      return c.json({
        message : "signed up",
        jwt: token
      })
    } catch (error) {
      console.log(error);
      c.status(401);
      c.text("invalid")
    }
    
  
   
  })