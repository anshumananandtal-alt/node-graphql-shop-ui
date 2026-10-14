import { createSlice } from "@reduxjs/toolkit"

const initCart = {
    items: []
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initCart,
    reducers: {
        setCartItems: (state, action)=>{
            state.items = action.payload
        },
        addToCart: (state, action )=>{
            const product = action.payload
            const existingItem = state.items.find(
                cartItem =>
                    (cartItem?.productId?._id ?? cartItem?.productId)?.toString() ===
                    product?._id?.toString()
            )
            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push({ quantity: 1, productId: product })
            }
        },
        removeFromCart: (state, action )=>{
            const productId = action.payload.productId
            state.items = state.items.filter(
                cartItem =>
                    (cartItem?.productId?._id ?? cartItem?.productId)?.toString() !==
                    productId?.toString()
            )
        },
        increaseQuantity: (state, action)=>{
            const productId = action.payload.productId
            const productIndex = state.items.findIndex(
                cartItem =>
                    (cartItem?.productId?._id ?? cartItem?.productId)?.toString() ===
                    productId?.toString()
            )

            if (productIndex >= 0) {
                state.items[productIndex].quantity += 1
            }
        },
        decreaseQuantity: (state, action)=>{
            const productId = action.payload.productId
            const productIndex = state.items.findIndex(
                cartItem =>
                    (cartItem?.productId?._id ?? cartItem?.productId)?.toString() ===
                    productId?.toString()
            )

            if (productIndex >= 0) {
                state.items[productIndex].quantity -= 1
                if (state.items[productIndex].quantity <= 0) {
                    state.items.splice(productIndex, 1)
                }
            }
        },
        clearCart: ()=>{
            return { items: [] }
        }
    }
})

export const {
    setCartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeFromCart,
    increastQuantity
} = cartSlice.actions


export default cartSlice.reducer
