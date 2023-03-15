import { OrderUpdatePayload } from "../models";
import BaseManager from "./BaseManager";

export interface OrderUpdateListener {
    onOrdersUpdated(orders: OrderUpdatePayload[]): void;
}

export class OrderManager extends BaseManager {

    private static orderMap: Record<string, OrderUpdatePayload> = {};
    private static orderList: OrderUpdatePayload[] = [];
    private static listeners: OrderUpdateListener[] = [];

    protected initialize(): void {
        this.syncOrders();
    }

    public async syncOrders() {
        const orders: OrderUpdatePayload[] = await this.tradeDelegate.getAllOrders();
        OrderManager.orderList = [];
        for (let order of orders) {
            this.updateOrder(order);
        }
    }

    private _invokeListeners() {
        for (let listener of OrderManager.listeners) {
            listener.onOrdersUpdated(OrderManager.orderList);
        }
    }

    public addListener(listener: OrderUpdateListener) {
        if (OrderManager.listeners.indexOf(listener) < 0) {
            OrderManager.listeners.push(listener);
        }
        this._invokeListeners();
    }

    public removeListener(listener: OrderUpdateListener) {
        const listenerIndex = OrderManager.listeners.indexOf(listener);
        if (listenerIndex > -1) {
            OrderManager.listeners.splice(listenerIndex, 1);
        }
    }

    public updateOrder(payload: OrderUpdatePayload) {
        OrderManager.orderMap[payload.order_id] = payload;
        const orderIndex = OrderManager.orderList.findIndex((order: OrderUpdatePayload) => {
            return order.order_id === payload.order_id;
        });
        if (orderIndex > -1) {
            OrderManager.orderList.splice(orderIndex, 1, payload);
        } else {
            OrderManager.orderList.push(payload);
        }
        this._invokeListeners();
    }

    public removeOrder(order_id: string) {
        if (OrderManager.orderMap[order_id]) {
            delete OrderManager.orderMap[order_id];
        }
        const orderIndex = OrderManager.orderList.findIndex((order: OrderUpdatePayload) => {
            return order.order_id === order_id;
        });
        if (orderIndex > -1) {
            OrderManager.orderList.splice(orderIndex, 1);
        }
    }

}