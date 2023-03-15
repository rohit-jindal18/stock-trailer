import { TPMode, TradingController } from "./controller/TradingController";
import { getNearestOptionValue, getNextDayOfWeek } from "./utils/helper";
// import express from 'express';

// const app = express()
// const port = 3000
// let tradingController: TradingController | undefined = undefined;

export default function initializeController(): void {
  new TradingController();
}


// app.get('/init', (req, res) => {
//   if (!tradingController) {
//     tradingController = new TradingController();
//   }
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })