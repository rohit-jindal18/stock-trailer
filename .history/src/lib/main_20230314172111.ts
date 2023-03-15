import { TPMode, TradingController } from "./controller/TradingController";
import { getNearestOptionValue, getNextDayOfWeek } from "./utils/helper";
// import express from 'express';

// const app = express()
// const port = 3000
// let tradingController: TradingController | undefined = undefined;




function sayMyName(name: string): void {
  if (name === "Heisenberg") {
    console.log("You're right 👍");
    console.log(getNearestOptionValue(17624));
    new TradingController();
  } else {
    console.log("You're wrong 👎");
  }
}

sayMyName("Heisenberg");


// app.get('/init', (req, res) => {
//   if (!tradingController) {
//     tradingController = new TradingController();
//   }
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })