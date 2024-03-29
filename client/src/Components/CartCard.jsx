import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addProdToCart,
    removeProdFromCart,
    clearCart,
    removeAllOneProdToCart,
    addCartToBack
} from '../redux/actions';
import { Link, useNavigate } from 'react-router-dom';
import Classes from './CartCard.module.css';
import trashIcon from '../images/trash.png';
import swal from 'sweetalert'


import { useAuth0 } from '@auth0/auth0-react';


export default function CartCard() {

    const dispatch = useDispatch();
    const prodCart = useSelector((state) => state.prodCart);
    const navigate = useNavigate();


    //--------------------------------------------------
    const { isAuthenticated, user } = useAuth0();

    //--------------------------------------------------

    var totalAmount = 0;

    for (let i = 0; i < prodCart.length; i++) {
        totalAmount = totalAmount + (prodCart[i].price * prodCart[i].quantity);
    }

    var totalQuantity = 0;

    for (let i = 0; i < prodCart.length; i++) {
        totalQuantity = totalQuantity + (prodCart[i].quantity);
    }



    const handleAddCart = (e) => {
        e.preventDefault();
        const productFinded = prodCart.find((item) => item.id === e.target.value);

        console.log('productFinded-->AGREGANDO', productFinded)

        if (productFinded.quantity < productFinded.in_Stock) {
            console.log('productFinded-->AGREGANDO')
            dispatch(addProdToCart(productFinded));
            if (isAuthenticated) {
                const itemInclud =
                    prodCart.length > 0
                        ?
                        prodCart.find((element) => element.id === e.target.value)
                        :
                        undefined

                const cartItems = itemInclud !== undefined
                    ?
                    prodCart.map((it) => it.id === e.target.value
                        ?
                        { ...it, quantity: it.quantity + 1 } : it)
                    :
                    [...prodCart, { ...productFinded, quantity: 1 }]

                dispatch(addCartToBack({ productsId: cartItems, email: user.email }))
            }

        } else {
            swal(`Insufficient stock in: ${productFinded.name}`);
        }
    }
    const handleRemoveCart = (e) => {
        e.preventDefault();
        const productFinded = prodCart.find((item) => item.id === e.target.value);
        console.log('productFinded-->RESTANDO', productFinded)
        if (productFinded.quantity === 1) {
            let confirmDelete = window.confirm(`Do you are sure, to delet this product of your cart?`)
            if (confirmDelete) {
                dispatch(removeProdFromCart({
                    id: e.target.value,
                }));
                if (isAuthenticated) {
                    let cartItems = prodCart.filter((upgrade) => upgrade.id !== e.target.value);
                    dispatch(addCartToBack({ productsId: cartItems, email: user.email }));
                }
            }
        } else {
            dispatch(removeProdFromCart({
                id: e.target.value,
            }));
            const cartUpgrade =
                prodCart.map((it) => it.id === e.target.value
                    ? { ...it, quantity: it.quantity - 1 }
                    : it)
            dispatch(addCartToBack({ productsId: cartUpgrade, email: user.email }));
        }

    }
    const handleBuy = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate(`/stripe/`);

        } else {
            swal('You need login, to finish your cart!');
            window.location.href = "https://dev-ea4kaqw0.us.auth0.com/u/login/identifier?state=hKFo2SB0NDg2WGJyaFZhbFNJeUFreE9OazZtUzdZWkxteHJEZaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIFYwOHQ3VXZPbEM5TDlSWU9zYTRZb0J6UTFrUjFQZHBqo2NpZNkgMkxJa2JFanM1S0xEc1Z6T0YxUHVlNWZab202S29zU2w";
        }
    }
    const handleDelete = (e) => {
        e.preventDefault();
        let confirmDelete = window.confirm("Do you are sure, to delet all cart?");
        if (confirmDelete) {
            dispatch(clearCart());
            navigate('/SearchDetail/shopall/allProducts');
            if (isAuthenticated) {
                dispatch(addCartToBack({ productsId: [], email: user.email }))
            }
        }

    }
    const handleDeleteOneProd = (e) => {
        e.preventDefault();
        let confirmDelete = window.confirm("Do you are sure, to delet this product?");
        if (confirmDelete) {
            const productFinded = prodCart.find((item) => item.id === e.target.value);
            dispatch(removeAllOneProdToCart(productFinded));
            if (isAuthenticated) {
                if (prodCart.length > 1) {
                    let cartItems = prodCart.filter((upgrade) => upgrade.id !== e.target.value);
                    dispatch(addCartToBack({ productsId: cartItems, email: user.email }));
                }else{
                    dispatch(addCartToBack({ productsId: [], email: user.email }))
                }

            }
        }



    }

    if (prodCart.length > 0) {
        return (
            <div className={Classes.container}>
                <h1 className={Classes.title}>{`Shopping Cart (${totalQuantity})`}</h1>
                <div >
                    <div >
                        {prodCart?.map(e => {
                            return (
                                <div className={Classes.grid} key={e.id}>
                                    <div className={Classes.cardContainer} >
                                        <Link to={'/details/' + e.id}><img src={e.image} alt='Img not found!' /></Link>
                                        <h3 className={Classes.cardName} >{(e.name).length > 25 ? (e.name).slice(0, 21).concat('...') : e.name}</h3>
                                        <div className={Classes.priceAndcart2}>
                                            <button value={e.id} className={Classes.btn2} onClick={handleRemoveCart}>-</button>
                                            <h3>{e.quantity}</h3>
                                            <button value={e.id} className={Classes.btn2} onClick={handleAddCart}>+</button>
                                        </div>
                                        <h3 className={Classes.price}>{`Price: $${e.price}`}</h3>
                                        <h3 className={Classes.subTotal}>{`Subtotal: $${e.price * e.quantity}`}</h3>
                                        <button value={e.id} className={Classes.btnTrash} onClick={handleDeleteOneProd} src={trashIcon}>X</button>
                                    </div>
                                </div>
                            )
                        })}
                        {/* <img src={trashIcon} alt='Icon not found!' width='30px' /> */}
                        {prodCart.length > 0 ? <h1 className={Classes.total}>Total: {`$${totalAmount}`}</h1> : ""}
                    </div>

                </div>
                <div className={Classes.buttonContainer}>
                    {prodCart.length > 0 ? <button className={Classes.buyCart} onClick={handleBuy}><h4>Buy 🛒</h4></button> : ""}

                    {prodCart.length > 0 ? <button className={Classes.vaciarCarrito} onClick={handleDelete} ><h4>Clear Cart</h4></button> : ""}
                </div>
            </div >

        );
    } else {
        return (
            <div className={Classes.container}>
                <h1 className={Classes.title}>Shopping Cart ()</h1>
            </div>
        )
    }
}