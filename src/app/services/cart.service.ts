import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems:CartItem[]=[];

  totalPrice:Subject<number>=new Subject<number>();
  totalQuantity:Subject<number>=new Subject<number>();

  constructor() { }
  addToCart(thecartItem:CartItem){
    let alreadyExistsInCart:boolean=false;
    let existingCartItem:CartItem|undefined;
    if(this.cartItems.length>0){
      /*for(let tempCartItem of this.cartItems){
        if(tempCartItem.id===thecartItem.id){
          existingCartItem=tempCartItem;
          break;
        }
      }*/
      existingCartItem=this.cartItems.find(tempCartItem=>tempCartItem.id===thecartItem.id);
      alreadyExistsInCart=(existingCartItem!=undefined);

    }
    if(alreadyExistsInCart){
      existingCartItem?.quantity?existingCartItem.quantity++:0;
    }
    else{
      this.cartItems.push(thecartItem);
    }
    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue:number=0;
    let totalQuantityValue:number=0;
    for(let currentCartItem of this.cartItems){
      totalPriceValue+=currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue+=currentCartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue,totalQuantityValue);
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice=tempCartItem.quantity*tempCartItem.unitPrice;
      console.log(`name:${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('---------');
  }
  decrementQuantity(theCartItem:CartItem){
    theCartItem.quantity--;

    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }
  remove(theCartItem: CartItem) {
    const indexItem=this.cartItems.findIndex(tempCartItem=>tempCartItem.id===theCartItem.id);
    if(indexItem>-1){
      this.cartItems.splice(indexItem,1);
    }
    this.computeCartTotals();
  }
}
