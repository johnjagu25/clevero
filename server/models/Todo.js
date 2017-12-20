var {mongoose}=require("./../db/mongoose");
var Todo = mongoose.model("Todo",{
    task:{type:"string",required:true},
    duedate: {type: Date,default:new Date()},
labels:{
    type:String,
    default:"Others"
},
status:{type: String,default:"New"},
creator:{type:String},
date: { type: Date, default: new Date() }
});

module.exports = {Todo}
