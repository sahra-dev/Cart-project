import { productsData } from "./products.js";

const modal = document.querySelector('.modal');
const backDrop = document.querySelector('.backdrop');
const cartIcon = document.querySelector('.cart-icon');
const confrimBtn = document.querySelector('.confrim-btn');
const productsItem = document.querySelector('.products');
const cartItems = document.querySelector('.cart-counter');
const cartTotal = document.querySelector('.modal-footer_total');
const modalProducts = document.querySelector('.modal-products');
const clearCart = document.querySelector('.clear-cart-btn');


let cart = [];
let buttonsDom = [];
cartIcon.addEventListener('click' ,showModal);
backDrop.addEventListener('click' , closeModal);
confrimBtn.addEventListener('click' , closeModal);
document.addEventListener('DOMContentLoaded' , () =>{
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI ;
    ui.setUpApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);
})


class Products {
    getProducts(){
        return productsData;
    }
}
class UI {
    displayProducts(products){
        let result = '' ;
        products.forEach(item => {
            result+=`
            <div class="product">
            <div class="product-img">
            <img class="product-image" src="${item.imageUrl}"/>
        </div>
        <div class="product-desc">
            <div class="product-title">${item.title}</div>
            <div class="product-price">${item.price}$</div>
        </div>
        <button class="add-in-cart" data-id=${item.id}> Add To Cart</button>
            </div>`;
        productsItem.innerHTML = result;
    } );

    }
    getAddToCartBtns(){
        const addToCart = [... document.querySelectorAll('.add-in-cart')];
        buttonsDom = addToCart ;
        // console.log(addToCart);
        addToCart.forEach( btn =>{
            const id = btn.dataset.id ;
            // console.log(id);
            const isInCart = cart.find( p => parseInt(p.id) === parseInt(id))
            if( isInCart){
                btn.innerHTML= 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click' , (e)=>{
                // console.log(e.target.dataset.id);

                e.target.innerText = 'In Cart';
                btn.disabled = true;
                btn.style.transform='none';
                const addedProduct = {... Storage.getProduct(id) , quantity:1} ;
                // console.log(addedProduct);
                cart = [... cart , addedProduct]
                Storage.saveCart(cart)
                this.setCartValue(cart)
                this.addCartItem(addedProduct);
                
                
            })
        })
    }
    setCartValue(cart){
        let tempCartItems = 0
        const totalPrice = cart.reduce((acc,curr) => {
            tempCartItems += curr.quantity;
            return acc + curr.quantity * curr.price
        },0);
        cartTotal.innerText = ` Total Price : ${totalPrice} $`;
        cartItems.innerText = tempCartItems;
        // console.log(tempCartItems);
    }
    addCartItem(cartItem){
        const div = document.createElement('div')
        div.classList.add('modal-product')
        let result =`<div class="modal-product_image">
        <img class="modal-product_img" src="${cartItem.imageUrl}"/>
    </div>
    <div class="modal-product_desc">
        <div class="modal-product_title"> ${cartItem.title}</div>
        <div class="modal-product_price"> ${cartItem.price}$</div>
    </div>
    <div class="modal-product_value">
        <span class="modal-product_value_up" data-id=${cartItem.id}></span>
        <span class="modal-product_value_number" data-id=${cartItem.id}>${cartItem.quantity}</span>
        <span class="modal-product_value_down" data-id=${cartItem.id}></span>

    </div>
    <div class="modal-product_trash" data-id=${cartItem.id}></div>`;
    div.innerHTML = result ;
    modalProducts.appendChild(div)

    }
    setUpApp(){
        cart = Storage.getCart() || [] ;
        cart.forEach( c=> this.addCartItem(c))
        this.setCartValue(cart)

    }
    cartLogic(){
        clearCart.addEventListener('click' , () => this.clearCart())
        modalProducts.addEventListener('click' , (e) =>{
             let className = e.target.classList;
            //  console.log(className);
             if(className.contains('modal-product_value_up')){
                // console.log(e.target.dataset.id);
                const addQuantity = e.target
                const addedItem = cart.find( cItem => parseInt(cItem.id) === parseInt(addQuantity.dataset.id))
                addedItem.quantity++ ;
                addQuantity.parentElement.children[1].innerText = addedItem.quantity;
                Storage.saveCart(cart);
                this.setCartValue(cart);
            }else if(className.contains('modal-product_value_down')){
                const removeQuantity = e.target
                const removedItem = cart.find( cItem => parseInt(cItem.id) === parseInt(removeQuantity.dataset.id))
                removedItem.quantity-- ;
                removeQuantity.parentElement.children[1].innerText = removedItem.quantity;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                if(removedItem.quantity<=0){
                    this.removeItem(e.target.dataset.id);
                    // console.log(e.target.parentElement.parentElement)
                    e.target.parentElement.parentElement.remove();
                }

             }else if(className.contains('modal-product_trash')){
                const removeQuantity = e.target
                const removedItem = cart.find( cItem => parseInt(cItem.id) === parseInt(removeQuantity.dataset.id))
                removedItem.quantity = 0 ;
                Storage.saveCart(cart);
                this.removeItem(e.target.dataset.id);
                    e.target.parentElement.remove();
            }
             
        })
    }
    clearCart(){
        cart.forEach( item => this.removeItem(item.id))
        while(modalProducts.children.length){
            modalProducts.removeChild(modalProducts.children[0])
        }
        closeModal()
        
    }
    removeItem(id){
        cart = cart.filter( item => parseInt(item.id) !== parseInt(id))
        this.setCartValue(cart);
        Storage.saveCart(cart);
        const button = buttonsDom.find( btn => parseInt(btn.dataset.id) === parseInt(id))
        // console.log(button.innerText)
        button.innerText = 'Add To Cart';
        button.disabled = false;
        
    }
}
class Storage {
    static saveProducts(products){
        localStorage.setItem('products' , JSON.stringify(products))
    }
    static getProduct(id){
        const _products = JSON.parse(localStorage.getItem('products'));
        return _products.find( p => p.id ===parseInt(id)) //return in mishe ye object

    }
    static saveCart(cart) {
        localStorage.setItem('cart' , JSON.stringify(cart))
    }
    static getCart(){
        return JSON.parse(localStorage.getItem('cart'));
    }
}


function showModal(){
    modal.style.display = 'block';
    modal.style.transform = 'translate(0,20vh)';
    backDrop.style.display = 'block';
}
function closeModal(){
    modal.style.display = 'none';
    modal.style.transform = 'translate(0,-100vh)';
    backDrop.style.display = 'none';
}