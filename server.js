// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1102150",
  key: "a01eebfe39d18a689046",
  secret: "a8e3fc5763ee7fc76bde",
  cluster: "eu",
  useTLS: true
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world"
});


//middleware
app.use(express.json());
app.use(cors());

// app.use((req, res, next) =>{
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

// DB config
const connection_url =
  "mongodb+srv://admin:q1PM0Nnaph9Pkkkl@cluster0.5sodb.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected");
  
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  
  changeStream.on('change', (change) =>{
    console.log( " I am the chnage made", change);

    if(change.operationType ==='insert'){
      const messageDetails = change.fullDocument;
      
      pusher.trigger('messages', 'inserted', {
        name:messageDetails.name,
        message: messageDetails.message,
      });
    }else{
      console.log("Error triggering Pusher");
    }
  });
});



 

// // ???

// //api routes
app.get("/", (req, res) => res.status(200).send("hello World"));

app.get("/messages/sync", (req, res) => {
  // console.log(res);
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err); //500- internal sever error
    } else {
      //   res.status(201).send(`new message created: \n ${data}`);
      res.status(201).send(data);
    }
  });
});

//listener
app.listen(port, () => console.log(`Listeninig on Localhost: ${port}`));
