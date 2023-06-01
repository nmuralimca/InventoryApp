using { cap_inventory as db } from '../db/data-model';

service UserService@(path:'/UserService'){
    entity Userdetail as projection on db.Userdetail;
    entity ProductMaster as projection on db.ProductMaster;
    entity ProductInv as projection on db.ProductInv;
    entity StockTransfer as projection on db.StockTransfer;
    entity StoreMaster as projection on db.StoreMaster;
    function TopSellingIndividualProduct() returns String;
    function TopSellingIndividualProductCategory() returns String;
    function TopSellingIndividualProductType() returns String;
    function getStockIncreaseYoY() returns String;
    function getStockIncreaseMoM() returns String;
    function TopStorewithStock() returns String;
}