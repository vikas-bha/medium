import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt';
import { createPostInput, updatePostInput } from "@vikas__bhardwaj/common/dist";
export const postRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string, 
        JWT_SECRET : string
    },
    Variables :{
        userId : string
    }
}>();


postRouter.use("/*",async (c, next)=>{
        const authHeader = c.req.header("authorization") || "";
       const user = await verify(authHeader, c.env.JWT_SECRET);
       if(user){
        c.set("userId", user.id);
       await next();
       }
       else{
        c.status(403);
        c.json({
            message : "you are not logged in"
        })
       }


})

postRouter.post("/", async (c)=>{
    const body = await c.req.json();
    const {success} = createPostInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message : "inputs are not correct"
        })
    }
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const post = await prisma.post.create({
        data: {
            title : body.title, 
            content: body.content, 
            authorId : Number(authorId)
        }
      })
    
    return c.json({
        id : post.id
    })
})

postRouter.put("/", async (c)=>{
    const body = await c.req.json();
    const {success} = updatePostInput.safeParse(body);
    if(!success)
{
    c.status(411);
    return c.json({
        message : "input not correect"
    })
}    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const post = await prisma.post.update({
        where :{
            id: body.id
        },
        data: {
            title : body.title, 
            content: body.content, 
        }
      })

      return c.json({
        id : post.id
      })

})

postRouter.get("/bulk", async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const posts = await prisma.post.findMany();

      return c.json({
        posts
      })
})


postRouter.get("/:id", async (c)=>{
    // const body = await c.req.json();
    const id = await c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())


   try {
    const post = await prisma.post.findFirst({
        where :{
            id : Number(id)
        }
    })

    return c.json({
        post 
    })
   } catch (error) {

    c.status(411);
    return c.json({
        message : "error while fetching the post"
    })
    
   }

})

