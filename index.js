const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId

const cors = require('cors')
require('dotenv').config()

const app = express()
// const port =process.env.PORT || 5000;
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ev8on.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  
   try{
    await client.connect();
    console.log("database connect")

    const database=client.db('bikeStore')
    const bikeCollection=database.collection('bikeProducts')
    const loginCollection=database.collection('userLogin')
    const myOrderCollection=database.collection('myOrder')
    const reviewCollection=database.collection('review')

    // database post all products 
    app.post('/bike',async(req,res)=>{
        const service=req.body;
        console.log('hit the post',service)

        const result=await bikeCollection.insertOne(service)
        console.log(result)
        res.json(result)
       // res.json('post hitten')
    });

    //get database load the data home page 
    app.get('/bike',async(req,res)=>{
        const cursor=bikeCollection.find({})
        const result=await cursor.toArray()
        res.json(result)
    });

    // parchage page or details page of get api 
    app.get('/bike/:id', async(req,res)=>{
        const id=req.params.id
        const query={_id:ObjectId(id)}
        const result=await bikeCollection.findOne(query)
        res.json(result)
    });

    // database post api user login 
    app.post('/userLogin',async(req,res)=>{
        const login=req.body;
        console.log(req.body)
        const result=await loginCollection.insertOne(login)
        res.json(result)
    });

    // google login user update only one user database store 
    app.put('/userLogin', async(req,res)=>{
        const user=req.body;
        const filter={email:user.email}
        const options = { upsert: true };
        const updateDoc={$set:user}
        const result=await loginCollection.updateOne(filter,updateDoc,options)
    });

    // database admin role 
    app.put('/userLogin/admin', async(req,res)=>{
        const user=req.body;
        console.log('put',user)
        const filter={email:user.email}
        const updateDoc={$set:{role:'admin'}}
        const result=await loginCollection.updateOne(filter,updateDoc)
        res.json(result)
    });

    // database searching check admin 
    app.get('/userLogin/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const user=await loginCollection.findOne(query)
        let isAdmin=false;
        if(user?.role==='admin'){
          isAdmin=true;
        }
        res.json({admin:isAdmin})
    });

    // myOrder the store database of post 
    app.post('/myOrder', async(req,res)=>{
        const order=req.body;
        const result=await myOrderCollection.insertOne(order)
        res.json(result)
    });

    // get myorder 
    app.get("/myOrder/:email", async (req, res) => {
        console.log(req.params.email);
        const result = await myOrderCollection
          .find({ email: req.params.email })
          .toArray();
        res.send(result);
      });

    //   delete api myorder 
    app.delete('/deleteOrder/:id', async(req,res)=>{
        const result=await myOrderCollection.deleteOne({_id:ObjectId(req.params.id)});
        res.json(result)
    })

    // get for manage all orders 
    app.get('/manageOrder', async(req,res)=>{
        const cursor=myOrderCollection.find({})
        const result=await cursor.toArray()
        console.log(result)
        res.json(result)
    });

    // upadate status for put api 
    app.put('/updateStatus/:orderId', async(req,res)=>{
        const id=req.params.orderId;
        const updateDoc=req.body.status;
        const filter={_id:ObjectId(id)}
        const result=await myOrderCollection.updateOne(filter,{
            $set:{status:updateDoc}
        })
        res.json(result)
    });

    // review add the post api 
    app.post('/review',async(req,res)=>{
        const review=req.body;
        const result=await reviewCollection.insertOne(review)
        res.json(result)
        // console.log(result)
    });

    // review get api 
    app.get('/review',async(req,res)=>{
        const cursor=reviewCollection.find({})
        const result=await cursor.toArray()
        console.log(result)
        res.json(result)
    });


    // manage product delete 
    // app.delete('deleteManage/:id',async(req,res)=>{
    //     const id=req.params.id;
    //     const query={_id:ObjectId(id)}
    //     const result=await bikeCollection.deleteOne(query)
    //     res.json(result)
    //     console.log(result)
    // })

    app.delete('/deleteManage/:id', async(req,res)=>{
        const result=await bikeCollection.deleteOne({_id:ObjectId(req.params.id)});
        res.json(result)
    })

   }

   finally{

   }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send("this is bike store")
})

app.listen(port,()=>{
    console.log('listen to port',port)
})