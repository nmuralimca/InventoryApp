namespace cap_inventory;

using {managed} from '@sap/cds/common';

entity Userdetail {
    key username : String
        @title : 'Username';
        password : String
        @title : 'Password';
        email    : String
        @title : 'Email';
        image    : LargeString
        @title : 'Image';
}

entity ProductMaster : managed {
    key prodId   : String
        @title : 'Product ID';
        prodCat  : String
        @title : 'Product Category';
        prodName : String
        @title : 'Product Name';
        prodType : String
        @title : 'Product Type';
        uom      : String
        @title : 'UOM';
        active   : Boolean
        @title : 'Active';
        qty      : Integer
        @title : 'Quantity';
// productInv : Association to many ProductInv on productInv.productMaster = $self;
}

entity ProductInv {
        prodId   : String
        @title : 'Product ID';
        prodCat  : String
        @title : 'Product Category';
        prodType : String
        @title : 'Product Type';
        uom      : String
        @title : 'UOM';
    key addedOn  : String
        @title : 'Added On';
        addedBy  : String
        @title : 'Added By';
        qty      : String
        @title : 'Qty';
        expDat   : String
        @title : 'Expiry Date';
        batch    : String
        @title : 'Batch No';
// productMaster : Association to one ProductMaster;
}
