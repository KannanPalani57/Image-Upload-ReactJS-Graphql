const express = require('express');
const app = express();
const multer = require("multer");
const cors = require("cors")
const fs = require("fs")
const path = require("path")
var util = require("util")
const readFile = util.promisify(fs.readFile);
const { image, sequelize } = require("./models")
var { graphql, buildSchema } = require('graphql');
var { graphqlHTTP } = require('express-graphql');
app.use(cors())

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("public"));
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"})) 
 
var schema = buildSchema(`
  type Query {
    hello: String,
    image: Image,
  }
  input ImageInput{
      id: ID!
  }
  type Image{
      response: String!,
  }
  input RemoveInput{
      id: ID!,
  }
  input AddInput{
      text: String,
  }
  type Text{
      text: String!,
  }
  type Mutation{
      addText(input: AddInput!): Text,
      removeImage(id: ID!): Text,
  }
`);

var root = {
    hello: () => {
      return 'Hello world!';
    },
    addText: ({input}) => {
        console.log(input.text)
        return {text: input.text}
    },
    removeImage: async ({id}) => {
        const removeImage = await image.findOne({where: {id}});
        console.log(removeImage)
        fs.unlink(
            `./public/images/${removeImage.imageName}`,async (err) => {
            if (err) {
              console.error(err)
              return
            }
             await image.destroy({where: {id}});
    
            res.redirect("/")
            console.log("the image was deleted")
          })
        return {text: "The image was deleted successfully"}
    }
  };





app.post("/removeImage", async (req, res) => {
    const id = req.body.data;
    // console.log(id)
    const removeImage = await image.findOne({where: {id: id.data}});
    console.log(removeImage.imageName)
    fs.unlink(`./public/images/${removeImage.imageName}`,async (err) => {
        if (err) {
          console.error(err)
          return
        }
         await image.destroy({where: {id: id.data}});

        res.redirect("/")
        console.log("the image was deleted")
      }) 
})

app.get("/getAllImages", async (req, res) => {
    const images = await image.findAll();
    res.send(images)
})

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './public/images';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf("."));
        const fileName =  file.fieldname  + Math.floor(Math.random()* 1000) + ext;
        image.create({imageName: fileName})  //here, we adding image name to db
        callback(null, fileName);
        // + Math.floor(Math.random()* 1000)
    } 
})

var upload = multer({storage: storage})
// 



app.post("/singleUpload", upload.single('singleImage'),(req, res, next) => {
        if (!req.file) {
            throw Error("FILE_MISSING");
        } 
        res.send("Upload completed."); 
})

app.post('/upload', upload.array('image', 12),function (req, res, next) {
        if (!req.files) {
            throw Error("FILE_MISSING");
        } 
        res.send("Upload completed.");    
})

app.get("/show", (req, res) => {
    res.sendFile(path.join(__dirname, "./uploads"));
})



app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
async function main(){
    await sequelize.sync();
    // members.create({firstName: "kannan", lastName: "palani", email: "krishna@gmail.com", password: "xyz", confirmPassword: "xyz"})
    app.listen(5000, () => {
        console.log("The server is running on the port 5000")
    })
}

main()

































// const express = require("express");
// const multer = require("multer")
// const path = require("path")
// const cors = require("cors")

// var app = express();

// app.use(cors())

// app.use(express.static("./public"))
// // const storage = multer.diskStorage({
// //     destination: "./public/uploads/",
// //     filename: function(req, file, cb){
// //         cb(null, file + "-" + Date.now() + path.extname(file.originalname))
// //     }
// // })

// // const upload = multer({
// //     storage: storage
// // }).single('file');

// var upload = multer({dest: 'public/images'})

// app.post("/upload", upload.single('file'), (req, res) => {
//     console.log(req.file)
// })


// app.listen(8000, () => {
//     console.log("server listening on 8000")
// })               




// fileNames = await fs.readdirSync("./public/images");
// var binaryImages = [];
// const removeImage = fileNames.filter(item => {
//     fs.readFile(`./public/images/${item}`, function(err, imgData){
//        const bashString =  new Buffer.from(imgData).toString('base64')
//        if(data === bashString){
//             return data;
//        }
//     })
// })