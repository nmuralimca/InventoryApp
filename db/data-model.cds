namespace cap_inventory;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity Userdetail {
    key username : String
        @title: 'Username';
        password : String
        @title: 'Password';
        email    : String
        @title: 'Email';
        image    : LargeString
        @title: 'Image';
}

entity ProductMaster : managed {
    key prodId   : String
        @title: 'Product ID';
        prodCat  : String
        @title: 'Product Category';
        prodName : String
        @title: 'Product Name';
        prodType : String
        @title: 'Product Type';
        uom      : String
        @title: 'UOM';
        qty      : String;
        active   : Boolean
        @title: 'Active';
}

entity ProductInv {
    key prodId   : String
        @title: 'Product ID';
        prodName : String
        @title: 'Product Name';
        prodCat  : String
        @title: 'Product Category';
        prodType : String
        @title: 'Product Type';
        uom      : String
        @title: 'UOM';
    key addedOn  : String
        @title: 'Added On';
        addedBy  : String
        @title: 'Added By';
        qty      : String
        @title: 'Qty';
        expDat   : String
        @title: 'Expiry Date';
        batch    : String
        @title: 'Batch No';
        stocks   : Integer
        @title: 'Stocks';
        status   : String
        @title: 'Status'
}

entity StockTransfer : managed {
    key stocktransId : UUID
        @title: 'Stock Transfer ID';
        storeId      : String
        @title: 'Store ID';
        prodId       : String
        @title: 'Product ID';
        prodCat      : String
        @title: 'Product Category';
        prodName     : String
        @title: 'Product Name';
        prodType     : String
        @title: 'Product Type';
        username     : String
        @title: 'Username';
        stocks       : Int32
        @title: 'Stocks;';
        addedOn     : String
        @title: 'Added On';
        StoreMaster  : Association to one StoreMaster;
}

entity StoreMaster : managed {
    key storeId       : String;
        storeName     : String;
        StockTransfer : Association to many StockTransfer
                            on StockTransfer.StoreMaster = $self;
}
