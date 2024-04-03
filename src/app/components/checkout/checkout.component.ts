import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { AMShopFormService } from 'src/app/services/amshop-form.service';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { AMShopValidators } from 'src/app/validators/amshop-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {


  checkoutFormGroup!:FormGroup;

  totalPrice:number=0;
  totalQuantity:number=0;

  creditCardYears:number[]=[];
  creditCardMonths:number[]=[];

  countries:Country[]=[];

  shippingAddressStates:State[]=[];
  billingAddressStates:State[]=[];

  storage:Storage=sessionStorage;

  stripe=Stripe(environment.stripePublishableKey);

  paymentInfo:PaymentInfo=new PaymentInfo();
  cardElement:any;
  displayError:any="";

  isDisabled:boolean=false;

  constructor(private formBuilder:FormBuilder,
              private amShopFormService:AMShopFormService,
              private cartService:CartService,
              private checkoutService:CheckoutService,
              private router:Router) { }

  ngOnInit(): void {

    this.setupStripePaymentForm();

    this.reviewCartDetails();

    const theEmail=JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup=this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName:new FormControl('',
                              [Validators.required,
                               Validators.minLength(2),
                               AMShopValidators.notOnlyWhitespace]),

        lastName:new FormControl('',
                              [Validators.required,
                               Validators.minLength(2),
                               AMShopValidators.notOnlyWhitespace]),

        email:new FormControl(theEmail,
                             [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street:new FormControl('',[Validators.required,Validators.minLength(2),
                    AMShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),
                  AMShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),
                     AMShopValidators.notOnlyWhitespace])
      }),
      billingAddress:this.formBuilder.group({
        street:new FormControl('',[Validators.required,Validators.minLength(2),
                    AMShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),
                  AMShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),
                     AMShopValidators.notOnlyWhitespace])
      }),
      creditCard:this.formBuilder.group({
       /* cardType:new FormControl('',[Validators.required]),
        nameOnCard:new FormControl('',[Validators.required,Validators.minLength(2),
                                       AMShopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']*/
      })


    });
    /*
    const startMonth:number=new Date().getMonth()+1;
    console.log("startMonth:"+startMonth);
    this.amShopFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrieved credit card months:"+JSON.stringify(data));
        this.creditCardMonths=data;
      }
    );
    this.amShopFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrieved credit card years:"+JSON.stringify(data));
        this.creditCardYears=data;
      }
    );*/

    this.amShopFormService.getCountries().subscribe(
      data=>{
        console.log("Retrieved countries: "+ JSON.stringify(data));
        this.countries=data;
      }
    );
  }
  setupStripePaymentForm() {
    var elements=this.stripe.elements();

    this.cardElement=elements.create('card',{hidePostalCode:true});
    this.cardElement.mount('#card-element');

    this.cardElement.on('change',(event:any)=>{

      this.displayError=document.getElementById('card-errors');

      if(event.complete){
        this.displayError.textContent="";
      }else if(event.error){
        this.displayError.textContent=event.error.message;
      }

    });

  }
  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data=>{this.totalPrice=data}
    )
    this.cartService.totalQuantity.subscribe(
      data=>{this.totalQuantity=data}
    )
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street')}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city')}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state')}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country')}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode')}

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType')};
  get creditCardNameOncard(){return this.checkoutFormGroup.get('creditCard.nameOnCard')};
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber')};
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode')};




  handleMonthsAndYears() {
    const creditCardFormGroup=this.checkoutFormGroup.get('creditCard');

    const currentYear:number=new Date().getFullYear();
    const selectedYear:number=Number(creditCardFormGroup?.value.expirationYear);

    let startMonth:number;

    if(currentYear===selectedYear){
      startMonth=new Date().getMonth()+1;
    }
    else{
      startMonth=1;
    }
    this.amShopFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrieved credit card months:"+JSON.stringify(data));
        this.creditCardMonths=data;
      }
    )
    }

  copyShippingAddressToBillingAddress($event: Event) {
    if((event?.target as HTMLInputElement).checked){
      this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates=this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates=[];
    }
    }
onSubmit(){

  console.log("Handling the submit button");

  if(this.checkoutFormGroup.invalid){
    this.checkoutFormGroup.markAllAsTouched();
    return;
  }

  let order=new Order();
  order.totalPrice=this.totalPrice;
  order.totalQuantity=this.totalQuantity;

  const cartItems=this.cartService.cartItems;

  /*let orderItems:OrderItem[]=[];

  for(let i=0;i<cartItems.length;i++){
    orderItems[i]=new OrderItem(cartItems[i]);
  }*/

  let orderItems:OrderItem[]=cartItems.map(tempCartItem=>new OrderItem(tempCartItem));

  let purchase = new Purchase();

  purchase.customer=this.checkoutFormGroup.controls['customer'].value;

  purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
  const shippingState:State=JSON.parse(JSON.stringify(purchase.shippingAddress.state))
  const shippingCountry:Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
  purchase.shippingAddress.state=shippingState.name;
  purchase.shippingAddress.country=shippingCountry.name;

  purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
  const billingState:State=JSON.parse(JSON.stringify(purchase.billingAddress.state))
  const billingCountry:Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
  purchase.billingAddress.state=billingState.name;
  purchase.billingAddress.country=billingCountry.name;

  purchase.order=order;
  purchase.orderItems=orderItems;

  this.paymentInfo.amount=Math.round(this.totalPrice*100);
  this.paymentInfo.currency="USD";
  this.paymentInfo.receiptEmail=purchase.customer.email;

  if(!this.checkoutFormGroup.invalid && this.displayError.textContent==""){

    this.isDisabled=true;

    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
      (paymentIntentResponse)=>{
        this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
          {
            payment_method:{
              card:this.cardElement,
              billing_details:{
                email:purchase.customer.email,
                name:`${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address:{
                  line1:purchase.billingAddress.street,
                  city:purchase.billingAddress.city,
                  state:purchase.billingAddress.state,
                  postal_code:purchase.billingAddress.zipCode,
                  country:this.billingAddressCountry.value.code
                }
              }
            }
          },{handleActions:false})
          .then((result:any)=>{
            if(result.error){
              alert(`There was an error: ${result.error.message} `);
              this.isDisabled=false;
            }else{
              this.checkoutService.placeOrder(purchase).subscribe({
                next:(response:any)=>{
                  alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                  this.resetCart();
                  this.isDisabled=true;
                },
                error:(err:any)=>{
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled=false;
                }
              })
            }
          });
      }
    );
  }else{
    this.checkoutFormGroup.markAllAsTouched();
    return;
  }

 /* console.log(this.checkoutFormGroup.get('customer')?.value);
  console.log("Email address is "+this.checkoutFormGroup.get('customer')?.value.email);

  console.log("The shipping address country is: "+this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
  console.log("The shipping address state is: "+this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
*/
}
  resetCart() {
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");
  }

getStates(formGroupName:string){
  const formGroup=this.checkoutFormGroup.get(formGroupName);

  const countryCode=formGroup?.value.country.code;
  const countryName=formGroup?.value.country.name;

  console.log(`${formGroupName} country code: ${countryCode}`);
  console.log(`${formGroupName} country name: ${countryName}`);

  this.amShopFormService.getStates(countryCode).subscribe(
    data=>{
      if(formGroupName==='shippingAddress'){
        this.shippingAddressStates=data;
      }
      else{
        this.billingAddressStates=data;
      }

      formGroup?.get('state')?.setValue(data[0]);

    }
  )

}

}
