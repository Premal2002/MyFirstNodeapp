//jshint esversion:6
const _=require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);

mongoose.connect("mongodb+srv://Prem09:Prem2002@cluster0.k7jpkbm.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do list",
});

const item2 = new Item({
  name: "Hit tie  button to add new item",
});

const item3 = new Item({
  name: "<-- hit this to delete the item",
});

const defaultItems = [item1, item2, item3];

const listSchema=new mongoose.Schema({
  name : String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {
  Item.find(function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data inserted Successfully");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemname = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name : itemname
  });

  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
 
  
});


app.post("/delete",function(req,res){
  const checkeditemID=req.body.checkBox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkeditemID,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Item Deleted from database");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    });
  }
  
});
app.get("/:customListName", function (req, res) {
 const customListName=_.capitalize(req.params.customListName);
 List.findOne({name:customListName},function(err,customList){
  if(!err){
    if(!customList){
      const list = new List({
        name : customListName,
        items : defaultItems
       });
      
       list.save();
      res.redirect("/"+customListName)
    }
    else{
      // console.log(customList.name);
      res.render("list",{listTitle:customList.name,newListItems:customList.items});
    }
  }
 });
 
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.Port || 3000, function () {
  console.log("Server started on port 3000");
});
