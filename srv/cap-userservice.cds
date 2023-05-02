using { cap_inventory as db } from '../db/data-model';

service UserService@(path:'/UserService'){
    entity Userdetail as projection on db.Userdetail;
    entity ProductMaster as projection on db.ProductMaster;
    entity ProductInv as projection on db.ProductInv;
}