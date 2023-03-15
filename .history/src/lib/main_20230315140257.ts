import { StockTrailerUser } from "@stock-trailer/types";
import { TPMode, TradingController } from "./controller/TradingController";
import { Exchange } from "./models";
import withSession from "./session";
import { getNearestOptionValue, getNextDayOfWeek } from "./utils/helper";
// import express from 'express';

// const app = express()
// const port = 3000
let tradingController: TradingController | undefined = undefined;

export function initializeController(userInfo: StockTrailerUser): void {
  console.log("called", tradingController);
  if (!tradingController) {
    console.log("called inside")
    tradingController = new TradingController(userInfo);
    console.log("called inside 2 ", tradingController);
  }
}

export async function getInstruments(exchange: Exchange) {
  console.log("trad", tradingController);
  return tradingController?.getProcessedInstruments(exchange);
}

export default tradingController;

// app.get('/init', (req, res) => {
//   if (!tradingController) {
//     tradingController = new TradingController();
//   }
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })