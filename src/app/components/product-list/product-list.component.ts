import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  //templateUrl: './product-list-table.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {


  products:Product[]=[];
  previousCategoryId: number=0;
  currentCategoryId: number=1;
  currentCategoryName: string ="";
  searchMode:boolean=false;
  thePageNumber:number=1;
  thePageSize:number=5;
  theTotalElements:number=0;
  previousKeyword:string="";

  constructor(private productService: ProductService,
              private cartService:CartService,
              private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
    this.listProducts();
    });
  }
  updatePageSize(pageSize: string) {
    this.thePageSize=+pageSize;
    this.thePageNumber=1;
    this.listProducts();
    }
  listProducts() {
    this.searchMode=this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
    this.handleListProducts();
    }

  }
  handleSearchProducts() {
    const theKeyword:string=this.route.snapshot.paramMap.get('keyword')!;
    if(this.previousKeyword!=theKeyword){
      this.thePageNumber=1;
    }
    this.previousKeyword=theKeyword;

    console.log(`keyword=${theKeyword}, pageNumber=${this.thePageNumber}`);
    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               theKeyword).subscribe(this.processResult());
  }
  handleListProducts(){
    const hasCategoryId:boolean=this.route.snapshot.paramMap.has('id');
    if(hasCategoryId){
      this.currentCategoryId=+this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName=this.route.snapshot.paramMap.get('name')!;
    }
    else{
      this.currentCategoryId=1;
      this.currentCategoryName='Books';
    }
    if(this.previousCategoryId!=this.currentCategoryId){
      this.thePageNumber=1;
    }
    this.previousCategoryId=this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId},thePageNumber=${this.thePageNumber}`);
    this.productService.getProductListPaginate(this.thePageNumber-1,
                                              this.thePageSize,
                                              this.currentCategoryId).subscribe(this.processResult());

  }
  processResult(){
    return (data:any)=>{
      this.products=data._embedded.products;
      this.thePageNumber=data.page.number+1;
      this.thePageSize=data.page.size;
      this.theTotalElements=data.page.totalElements;
    };
  }
  addToCart(theProduct:Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    const theCartItem=new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }

}
