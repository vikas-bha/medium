import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
// const prisma = new PrismaClient({
//     datasourceUrl: env.DATABASE_URL,
// }).$extends(withAccelerate())
import { userRouter } from './routes/user';
import { postRouter } from './routes/post';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/post",postRouter);


// app.use('/api/v1/blog/*', async(c, next)=>{

//   const header = c.req.header("authorization") || "";
//   const token = header.split(" ")[1]
//   const response = await verify(header, c.env.JWT_SECRET);
//   if(response.id){
//     await next();
//   }
//   else{
//      c.status(403);
//      return c.json({error : "unauthorized"})
//   }
 
// })



// app.get('/api/v1/blog/:id', (c) => {
//   const id = c.req.param('id')
//   console.log(id);
//   return c.text('get blog route')
// })

// app.post('/api/v1/blog', (c) => {

//   return c.text('signin route')
// })

// app.put('/api/v1/blog', (c) => {
//   return c.text('signin route')
// })



export default app
