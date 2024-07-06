//init folder ke inner me isme humne data insert kera h for the help of data.js
const mongoose=require('mongoose');
const initdata=require('./data.js');
const Listing=require('../models/listing.js');
main().then(()=>console.log('DB is connected'))
.catch(err => console.log(err));
async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
}
let initDB=async ()=>{
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:'6635a554525685714ee2c7f2'}));
    await Listing.insertMany(initdata.data);
    console.log('data initialized');
}
initDB();