const cds = require('@sap/cds');
const res = require('express/lib/response');

module.exports = cds.service.impl(async (srv) => {

    const { Userdetail, ProductMaster, ProductInv, StockTransfer, StoreMaster } = srv.entities;

    srv.after('READ', 'ProductInv', each => {

        if (each.stocks == 0)
            each.status = 'No Stock'
        else if (each.stocks <= 10)
            each.status = 'Low Stock'
        else
            each.status = 'Stock Available'
    });

    srv.after('CREATE', 'StockTransfer', async (stockTransfer, req) => {
        const { ProductInv } = srv.entities;
        const { prodId, addedOn, stocks } = stockTransfer;

        const invStock = await SELECT.one('stocks')
            .from(ProductInv)
            .where({ prodId, addedOn });

        const currentStock = invStock.stocks || 0;
        const updatedStock = currentStock - stocks;

        await UPDATE(ProductInv)
            .set({ stocks: updatedStock })
            .where({ prodId, addedOn });

        console.log('Stock updated:', updatedStock);
    });

    srv.on('TopSellingIndividualProduct', async (req) => {

        const results = await SELECT.from(StockTransfer)
            .groupBy(StockTransfer.prodId)
            .orderBy({ stocks: 'desc' })
            .limit(1);

        return results;
    });

    srv.on('TopSellingIndividualProductCategory', async (req) => {
        const results = await SELECT.from(StockTransfer).columns(['prodCat', 'SUM(stocks) as totalStocks']).groupBy('prodCat')
            .orderBy({ totalStocks: 'desc' });
        return results;
    });

    srv.on('TopSellingIndividualProductType', async (req) => {

        const results = await SELECT.from(StockTransfer).columns(['prodType', 'SUM(stocks) as totalStocks']).groupBy('prodType')
            .orderBy({ totalStocks: 'desc' });
        return results;

    });

    srv.on('getStockIncreaseYoY', async (req) => {

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const currentYearStock = await SELECT.one('SUM(stocks) as totalStock')
            .from(StockTransfer)
            .where({ createdAt: { like: `${currentYear}-%` } });

        const previousYearStock = await SELECT.one('SUM(stocks) as totalStock')
            .from(StockTransfer)
            .where({ createdAt: { like: `${previousYear}-%` } });

        const stockIncrease = currentYearStock.totalStock - previousYearStock.totalStock;

        return stockIncrease;

    });

    

    srv.on('getStockIncreaseMoM', async (req) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 });

        var previousYear, previousMonth;
        if (currentMonth === '01') {
            previousYear = currentYear - 1;
            previousMonth = '12';
        } else {
            previousYear = currentYear;
            previousMonth = (currentMonth - 1).toLocaleString('en-US', { minimumIntegerDigits: 2 });
            console.log('========> Previous Month:', previousMonth);
        }

        try {
            const currentMonthStock = await SELECT.one('SUM(stocks) as totalStock')
                .from(StockTransfer)
                .where({ createdAt: { like: `${currentYear}-${currentMonth}-%` } });

            const previousMonthStock = await SELECT.one('SUM(stocks) as totalStock')
                .from(StockTransfer)
                .where({ createdAt: { like: `${previousYear}-${previousMonth}-%` } });

            const currentStockSum = currentMonthStock.totalStock || 0;
            const previousStockSum = previousMonthStock.totalStock || 0;

            const stockIncreaseMoM = currentStockSum - previousStockSum;
            const percentageChange = ((stockIncreaseMoM / previousStockSum) * 100).toFixed(2);

            console.log('========> Current:', currentMonthStock);
            console.log('========> Previous:', previousMonthStock);
            console.log('========> Stock Increase MoM:', stockIncreaseMoM);
            console.log('========> Percentage Change:', percentageChange);
            let currentPeriod = currentYear + '-' + currentMonth;
            let PreviousPeriod = previousYear + '-' + previousMonth;
            return {
                currentPeriod,
                PreviousPeriod,
                stockIncreaseMoM,
                percentageChange
            };
        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while calculating stock increase MoM.');
        }
    });


    srv.on('TopStorewithStock', async (req) => {
        const { StoreMaster, StockTransfer } = srv.entities;

        const results = await SELECT.from(StockTransfer).columns(['storeId', 'SUM(stocks) as totalStocks']).groupBy('storeId')
        .orderBy({ totalStocks: 'desc' }).limit(1);
        
        const sname = await SELECT.from(StoreMaster).columns(['storeName']).where({ storeId:results[0].storeId })

    const storeId = results[0].storeId;
    const storeName = sname[0].storeName;
    const totalStocks = results[0].totalStocks;

    return { storeId, storeName, totalStocks };
    });

});

